import chalk from 'chalk'
import { executeStatement, escapeId } from 'resolve-cloud-common/postgres'

import refreshToken from '../../refreshToken'
import { get, post } from '../../api/client'
import { logger, renderByTemplate, disableLogger } from '../../utils/std'
import setupCloudCredentials from '../../utils/setup-cloud-credentials'
import { getResolvePackageVersion } from '../../config'
import { importEventStore } from './import'
import { HEADER_EXECUTION_MODE } from '../../constants'

const cloneEventStore = async (params: {
  token: string
  prevEventStoreId: string
  eventStoreId: string
}) => {
  const { token, prevEventStoreId, eventStoreId } = params

  const {
    result: {
      region,
      accessKeyId,
      secretAccessKey,
      sessionToken,
      eventStoreSecretArn: secretArn,
      eventStoreClusterArn,
      eventStoreDatabaseName: sourceEventStoreDatabaseName,
    },
  } = await get(token, `/event-stores/${prevEventStoreId}`, undefined, {
    [HEADER_EXECUTION_MODE]: 'async',
  })

  const {
    result: { eventStoreDatabaseName: targetEventStoreDatabaseName },
  } = await get(token, `/event-stores/${eventStoreId}`, undefined, {
    [HEADER_EXECUTION_MODE]: 'async',
  })

  setupCloudCredentials({
    accessKeyId,
    secretAccessKey,
    sessionToken,
  })

  const tableNames = ['secrets', 'events', 'events-threads']

  const counts: Record<string, number> = {}

  for (const tableName of tableNames) {
    const [{ count } = { count: 0 }] = await executeStatement({
      Region: region,
      ResourceArn: eventStoreClusterArn,
      SecretArn: secretArn,
      Sql: `SELECT COUNT(*) FROM ${escapeId(sourceEventStoreDatabaseName)}.${escapeId(tableName)}`,
    })
    counts[tableName] = count
    logger.info(`Total ${tableName}: ${count}`)
  }

  for (const tableName of tableNames) {
    await executeStatement({
      Region: region,
      ResourceArn: eventStoreClusterArn,
      SecretArn: secretArn,
      Sql: `DELETE FROM ${escapeId(targetEventStoreDatabaseName)}.${escapeId(tableName)}`,
    })

    const [{ count: eventsCount } = { count: 0 }] = await executeStatement({
      Region: region,
      ResourceArn: eventStoreClusterArn,
      SecretArn: secretArn,
      Sql: `SELECT COUNT(*) FROM ${escapeId(sourceEventStoreDatabaseName)}.${escapeId(tableName)}`,
    })

    if (tableName === 'events') {
      const batchSize = 50000
      for (let index = 0; index < eventsCount; index += batchSize) {
        for (let retry = 0; retry < 10; retry++) {
          try {
            await executeStatement({
              Region: region,
              ResourceArn: eventStoreClusterArn,
              SecretArn: secretArn,
              Sql: `
                INSERT INTO ${escapeId(targetEventStoreDatabaseName)}.${escapeId(tableName)}
                SELECT * FROM ${escapeId(sourceEventStoreDatabaseName)}.${escapeId(tableName)}
                ORDER BY "threadId" ASC, "threadCounter" ASC
                LIMIT ${batchSize}
                OFFSET ${index}
                ON CONFLICT DO NOTHING`,
            })
            logger.info(`Progress ${tableName}: ${index + batchSize} / ${counts[tableName]}`)
            break
          } catch (error) {
            if (!/canceling statement due to user request/.test(`${error}`)) {
              throw error
            }
            logger.info(
              `Progress ${tableName}: ${index + batchSize} / ${counts[tableName]}. Retry ${
                retry + 1
              } / 10`
            )
          }
        }
      }
    } else {
      await executeStatement({
        Region: region,
        ResourceArn: eventStoreClusterArn,
        SecretArn: secretArn,
        Sql: `INSERT INTO ${escapeId(targetEventStoreDatabaseName)}.${escapeId(
          tableName
        )} SELECT * FROM ${escapeId(sourceEventStoreDatabaseName)}.${escapeId(
          tableName
        )} ON CONFLICT DO NOTHING`,
      })

      logger.info(`Progress ${tableName}: ${counts[tableName]} / ${counts[tableName]}`)
    }
  }

  const [{ maxSecretIdx } = { maxSecretIdx: 0 }] = await executeStatement({
    Region: region,
    ResourceArn: eventStoreClusterArn,
    SecretArn: secretArn,
    Sql: `SELECT MAX("idx") as "maxSecretIdx" FROM ${escapeId(
      sourceEventStoreDatabaseName
    )}.${escapeId('secrets')}`,
  })

  await executeStatement({
    Region: region,
    ResourceArn: eventStoreClusterArn,
    SecretArn: secretArn,
    Sql: `ALTER SEQUENCE ${escapeId(targetEventStoreDatabaseName)}.${escapeId(
      'secrets_idx_seq'
    )} RESTART WITH ${maxSecretIdx + 1}`,
  })

  for (const tableName of tableNames) {
    const [{ count } = { count: 0 }] = await executeStatement({
      Region: region,
      ResourceArn: eventStoreClusterArn,
      SecretArn: secretArn,
      Sql: `SELECT COUNT(*) FROM ${escapeId(targetEventStoreDatabaseName)}.${escapeId(tableName)}`,
    })
    counts[tableName] = count
    logger.info(`Total ${tableName}: ${count}`)
  }
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': prevEventStoreId, 'import-from': eventStorePath, format } = params
  if (format != null) {
    disableLogger()
  }
  const version = getResolvePackageVersion()

  const {
    result: { eventStoreId },
  } = await post(token, `/event-stores`, { version }, { [HEADER_EXECUTION_MODE]: 'async' })

  logger.info(`Event store ID: ${eventStoreId}`)

  if (prevEventStoreId != null) {
    await cloneEventStore({
      token,
      prevEventStoreId,
      eventStoreId,
    })
  }

  if (eventStorePath != null) {
    await importEventStore({
      eventStorePath,
      eventStoreId,
    })
  }

  if (renderByTemplate(format, { eventStoreId })) {
    return
  }

  logger.success(`Event store with "${eventStoreId}" id has been created`)
})

export const command = 'create'
export const describe = chalk.green('create an event-store')
export const builder = (yargs: any) =>
  yargs
    .option('import-from', {
      describe: 'path to the previously exported event-store directory',
      type: 'string',
    })
    .option('format', {
      describe: `Format the output using the given mustache template http://mustache.github.io/
      Possible fields: eventStoreId`,
      type: 'string',
    })
    .group(['import-from', 'format'], 'Options:')
    .example([
      ['yarn resolve-cloud event-stores create', 'Create new empty event-store'],
      [
        'yarn resolve-cloud event-stores create --import-from=<path-to-event-store-directory>',
        'Create a new event store and import data from a previously exported event store directory',
      ],
      [
        'NEW_EVENT_STORE=$(yarn -s resolve-cloud event-stores create --format="{{ eventStoreId }}")',
        'Create a new empty event store and save its event-store-id in env',
      ],
    ])
