import chalk from 'chalk'
import createAdapter from '@resolve-js/eventstore-postgresql-serverless'

import { get } from '../../api/client'
import { out, logger } from '../../utils/std'
import refreshToken from '../../refreshToken'

export const clearEventStore = async (params: { token: string; eventStoreId: string }) => {
  const { token, eventStoreId } = params

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

  const eventStoreAdapter = createAdapter({
    databaseName: eventStoreDatabaseName,
    dbClusterOrInstanceArn: eventStoreClusterArn,
    awsSecretStoreArn: eventStoreSecretArn,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    region,
  })

  await eventStoreAdapter.drop()
  await eventStoreAdapter.init()
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': eventStoreId } = params

  await clearEventStore({
    token,
    eventStoreId,
  })
  logger.success('Event-stores clear successfully completed!')

  out(
    'Run the "read-models reset-all" and "sagas reset-all" commands to reset read-models and sagas'
  )
})

export const command = 'clear <event-store-id>'
export const describe = chalk.green('clear an event-store')
export const builder = (yargs: any) =>
  yargs.positional('event-store-id', {
    describe: chalk.green("an existing event store's id"),
    type: 'string',
  })
