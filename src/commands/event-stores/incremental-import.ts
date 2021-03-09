import fs from 'fs'
import chalk from 'chalk'
import createAdapter from '@resolve-js/eventstore-postgresql-serverless'
import readline from 'readline'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { logger } from '../../utils/std'

export const incrementalImportEventStore = async (params: {
  token: string
  eventStoreId: string
  eventStorePath: string
}) => {
  const { token, eventStorePath, eventStoreId } = params

  const {
    result: {
      eventStoreDatabaseName,
      eventStoreClusterArn,
      eventStoreSecretArn,
      region,
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
  } = await get(token, `/event-stores/${eventStoreId}`)

  const makeAdapter = createAdapter.bind(null, {
    databaseName: eventStoreDatabaseName,
    dbClusterOrInstanceArn: eventStoreClusterArn,
    awsSecretStoreArn: eventStoreSecretArn,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    region,
  })

  let adapter = makeAdapter()

  if (!fs.existsSync(eventStorePath)) {
    throw new Error(`No such file "${eventStorePath}"`)
  }

  try {
    await adapter.rollbackIncrementalImport()
  } catch (e) {}

  const importId = await adapter.beginIncrementalImport()
  await adapter.dispose()
  const inStreamToPush = fs.createReadStream(eventStorePath)

  const applyingEventsContent: any[] = []
  const applyingEventsCumulativeSizes: any[] = []
  let batchPushPromises: any[] = []
  const syncPromises: any[] = []

  const readByLine = readline.createInterface({ input: inStreamToPush })
  const errors = []
  syncPromises.push(new Promise((resolve) => readByLine.on('close', resolve)))

  const oneTimePush = async (events: any) => {
    const adp = makeAdapter()
    await adp.pushIncrementalImport(events, importId)
    await adp.dispose()
  }

  readByLine.on('line', async (line) => {
    try {
      applyingEventsContent.push(JSON.parse(line))
      applyingEventsCumulativeSizes.push(
        (applyingEventsCumulativeSizes.length > 0
          ? applyingEventsCumulativeSizes[applyingEventsCumulativeSizes.length - 1]
          : 0) + line.length
      )
    } catch (error) {
      errors.push(error)
      readByLine.close()
      return
    }

    if (applyingEventsCumulativeSizes[applyingEventsCumulativeSizes.length - 1] <= 10000) {
      return
    }
    const [slicedSize, spliceIdx] = applyingEventsCumulativeSizes.reduce(
      ([sum, lastIdx, stop], val, idx) =>
        sum + val > 10000 || stop ? [sum, lastIdx, true] : [sum + val, idx, stop],
      [0, -1, false]
    )
    if (spliceIdx < 0) {
      errors.push(new Error('Big size event'))
      readByLine.close()
      return
    }
    const pushingEvents = applyingEventsContent.splice(0, spliceIdx + 1)
    applyingEventsCumulativeSizes.splice(0, spliceIdx + 1)
    for (let idx = 0; idx < applyingEventsCumulativeSizes.length; idx++) {
      applyingEventsCumulativeSizes[idx] -= slicedSize
    }

    batchPushPromises.push(
      Promise.resolve()
        .then(oneTimePush.bind(null, pushingEvents))
        .catch((error) => {
          errors.push(error)
          readByLine.close()
        })
    )

    if (batchPushPromises.length > 16) {
      readByLine.pause()
      syncPromises.push(Promise.all(batchPushPromises))
      batchPushPromises = []
      await syncPromises[syncPromises.length - 1]
      readByLine.resume()
    }
  })

  await Promise.all(syncPromises)

  if (batchPushPromises.length > 0) {
    await Promise.all(batchPushPromises)
  }

  try {
    await oneTimePush(applyingEventsContent)
  } catch (error) {
    errors.push(error)
  }

  if (errors.length > 0) {
    const error = new Error(errors.map((err) => err.message).join('\n'))
    error.stack = errors.map((err) => err.stack).join('\n')
    throw error
  }

  adapter = makeAdapter()
  await adapter.commitIncrementalImport(importId, true)
  await adapter.dispose()
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { path: eventStorePath, 'event-store-id': eventStoreId } = params

  await incrementalImportEventStore({
    token,
    eventStoreId,
    eventStorePath,
  })

  logger.success('Incremental import event-store successfully completed!')
})

export const command = 'incremental-import <event-store-id> <path>'
export const describe = chalk.green('incrementally import an event store to the cloud')
export const builder = (yargs: any) =>
  yargs
    .positional('event-store-id', {
      describe: chalk.green("an existing event store's id"),
      type: 'string',
    })
    .positional('path', {
      describe: chalk.green('path to the events file'),
      type: 'string',
    })
