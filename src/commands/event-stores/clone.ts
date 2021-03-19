import chalk from 'chalk'
import { executeStatement, escapeId } from 'resolve-cloud-common/postgres'

import refreshToken from '../../refreshToken'
import { get, post } from '../../api/client'
import { logger, renderByTemplate, disableLogger } from '../../utils/std'
import setupCloudCredentials from '../../utils/setup-cloud-credentials'
import { getResolvePackageVersion } from '../../config'
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
    logger.info(`[Source] Total ${tableName}: ${count}`)
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
        const endIndex = Math.min(index + batchSize, eventsCount)

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
            logger.info(
              `[Source->Target] Progress ${tableName}: ${endIndex} / ${counts[tableName]}`
            )
            break
          } catch (error) {
            if (!/canceling statement due to user request/.test(`${error}`)) {
              throw error
            }
            logger.info(
              `[Source->Target] Progress ${tableName}: ${endIndex} / ${counts[tableName]}. Retry ${
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

      logger.info(
        `[Source->Target] Progress ${tableName}: ${counts[tableName]} / ${counts[tableName]}`
      )
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
    logger.info(`[Target] Total ${tableName}: ${count}`)
  }
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': prevEventStoreId, format } = params
  if (format != null) {
    disableLogger()
  }
  const version = getResolvePackageVersion()

  const {
    result: { eventStoreId },
  } = await post(token, `/event-stores`, { version }, { [HEADER_EXECUTION_MODE]: 'async' })

  logger.info(`[Target] Event store ID: ${eventStoreId}`)

  await cloneEventStore({
    token,
    prevEventStoreId,
    eventStoreId,
  })

  if (renderByTemplate(format, { eventStoreId })) {
    return
  }

  logger.success(`Event store with "${eventStoreId}" id has been created`)
})

export const command = 'clone <event-store-id>'
export const describe = chalk.green('clone an existing event store')
export const builder = (yargs: any) =>
  yargs
    .positional('event-store-id', {
      describe: chalk.green("an existing event store's id"),
      type: 'string',
    })
    .option('format', {
      describe: `Format the output using the given mustache template http://mustache.github.io/
      Possible fields: eventStoreId`,
      type: 'string',
    })
    .group(['format'], 'Options:')
    .example([
      ['yarn resolve-cloud event-stores create', 'Create new empty event store'],
      [
        'yarn resolve-cloud event-stores clone <event-store-id>',
        'Clone an existing event store by id',
      ],
      [
        'NEW_EVENT_STORE=$(yarn -s resolve-cloud event-stores clone <event-store-id> --format="{{ eventStoreId }}")',
        'Clone an existing event store and save its event-store-id in env',
      ],
    ])
