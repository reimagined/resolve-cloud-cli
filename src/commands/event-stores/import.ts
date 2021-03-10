import { promisify } from 'util'
import { pipeline } from 'stream'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { MAINTENANCE_MODE_MANUAL, EventstoreAlreadyFrozenError } from '@resolve-js/eventstore-base'

import refreshToken from '../../refreshToken'
import { logger } from '../../utils/std'
import getAdapterWithCredentials from '../../utils/get-adapter-with-credentials'

export const importEventStore = async (params: {
  token: string
  eventStorePath: string
  eventStoreId: string
}) => {
  const { token, eventStorePath, eventStoreId } = params

  const pathToEvents = path.resolve(process.cwd(), eventStorePath, 'events.db')
  const pathToSecrets = path.resolve(process.cwd(), eventStorePath, 'secrets.db')

  if (!fs.existsSync(pathToEvents)) {
    throw new Error(`No such file or directory "${pathToEvents}"`)
  }

  if (!fs.existsSync(pathToSecrets)) {
    throw new Error(`No such file or directory "${pathToSecrets}"`)
  }

  const exportedEventsFileSize = fs.statSync(pathToEvents).size

  let eventStoreAdapter = await getAdapterWithCredentials({ token, eventStoreId })
  let byteOffset = 0

  try {
    await eventStoreAdapter.init()
  } catch (error) {
    if (!/duplicate initialization/.test(error.message)) {
      throw error
    }
  }

  logger.start(`importing the event-store to the cloud`)

  for (;;) {
    try {
      const importStream = eventStoreAdapter.importEvents({
        byteOffset,
        maintenanceMode: MAINTENANCE_MODE_MANUAL,
      })

      const pipelinePromise = promisify(pipeline)(
        fs.createReadStream(pathToEvents, { start: byteOffset }),
        importStream
      ).then(() => false)

      let timeoutResolve: any
      let timeout

      const timeoutPromise = new Promise<boolean>((resolve) => {
        timeoutResolve = resolve
        timeout = setTimeout(() => {
          resolve(true)
        }, 30 * 60 * 1000)
      })

      const isJsonStreamTimedOut = await Promise.race([timeoutPromise, pipelinePromise])

      if (isJsonStreamTimedOut) {
        importStream.emit('timeout')
        await pipelinePromise
      } else if (timeoutResolve != null) {
        clearTimeout(timeout)
        timeoutResolve(true)
      }

      byteOffset = (importStream as any).byteOffset

      if (byteOffset >= exportedEventsFileSize) {
        break
      }

      eventStoreAdapter = await getAdapterWithCredentials({ token, eventStoreId })
    } catch (error) {
      if (EventstoreAlreadyFrozenError.is(error)) {
        await eventStoreAdapter.unfreeze()
      } else {
        throw error
      }
    }
  }
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { path: eventStorePath, 'event-store-id': eventStoreId } = params

  await importEventStore({
    token,
    eventStorePath,
    eventStoreId,
  })

  logger.success('Import event-store successfully completed!')
})

export const describe = chalk.green('import an event-store to the cloud')
export const command = 'import <event-store-id> <path>'
export const builder = (yargs: any) =>
  yargs
    .positional('event-store-id', {
      describe: chalk.green("an existing event store's id"),
      type: 'string',
    })
    .positional('path', {
      describe: chalk.green('path to the event-store directory'),
      type: 'string',
    })
