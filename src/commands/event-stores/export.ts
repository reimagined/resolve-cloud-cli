import { promisify } from 'util'
import { pipeline } from 'stream'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { EventstoreAlreadyFrozenError, MAINTENANCE_MODE_MANUAL } from '@resolve-js/eventstore-base'

import refreshToken from '../../refreshToken'
import { logger } from '../../utils/std'
import getAdapterWithCredentials from '../../utils/get-adapter-with-credentials'

export const exportEventStore = async (params: {
  eventStorePath: string
  eventStoreId: string
}) => {
  const { eventStorePath, eventStoreId } = params

  const pathToEventStore = path.resolve(process.cwd(), eventStorePath)

  if (!fs.existsSync(pathToEventStore)) {
    fs.mkdirSync(pathToEventStore)
  }

  const pathToEvents = path.join(pathToEventStore, 'events.db')
  const pathToSecrets = path.join(pathToEventStore, 'secrets.db')

  let eventStoreAdapter = await getAdapterWithCredentials({ eventStoreId })
  let cursor = null
  let isJsonStreamTimedOutOnce = false

  for (;;) {
    try {
      const exportStream = eventStoreAdapter.exportEvents({
        cursor,
        maintenanceMode: MAINTENANCE_MODE_MANUAL,
      })

      const writeStream = fs.createWriteStream(pathToEvents, {
        flags: isJsonStreamTimedOutOnce ? 'a' : 'w',
      })

      const pipelinePromise = promisify(pipeline)(exportStream, writeStream).then(() => false)

      let timeoutResolve: any
      let timeout

      const timeoutPromise = new Promise<boolean>((resolve) => {
        timeoutResolve = resolve
        timeout = setTimeout(() => {
          resolve(true)
        }, 30 * 60 * 1000)
      })

      const isJsonStreamTimedOut = await Promise.race([timeoutPromise, pipelinePromise])
      isJsonStreamTimedOutOnce = isJsonStreamTimedOutOnce || isJsonStreamTimedOut

      if (isJsonStreamTimedOut) {
        exportStream.emit('timeout')
        await pipelinePromise
      } else if (timeoutResolve != null) {
        clearTimeout(timeout)
        timeoutResolve(true)
      }

      if ((exportStream as any).isEnd) {
        break
      }

      cursor = (exportStream as any).cursor
      eventStoreAdapter = await getAdapterWithCredentials({ eventStoreId })
    } catch (error) {
      if (EventstoreAlreadyFrozenError.is(error)) {
        await eventStoreAdapter.unfreeze()
      } else {
        throw error
      }
    }
  }

  await promisify(pipeline)(eventStoreAdapter.exportSecrets(), fs.createWriteStream(pathToSecrets))
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { path: eventStorePath, 'event-store-id': eventStoreId } = params

  logger.start(`exporting the event-store from the cloud`)

  await exportEventStore({
    eventStorePath,
    eventStoreId,
  })

  logger.success('Export event-store successfully completed!')
})

export const describe = chalk.green('export an event store from the cloud')
export const command = 'export <event-store-id> <path>'
export const builder = (yargs: any) =>
  yargs
    .positional('event-store-id', {
      describe: chalk.green("an existing event store's id"),
      type: 'string',
    })
    .positional('path', {
      describe: chalk.green('path to the event store directory'),
      type: 'string',
    })
