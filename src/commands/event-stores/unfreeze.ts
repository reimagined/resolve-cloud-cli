import chalk from 'chalk'
import createAdapter from '@resolve-js/eventstore-postgresql-serverless'
import { EventstoreAlreadyUnfrozenError } from '@resolve-js/eventstore-base'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { logger } from '../../utils/std'

export const unfreezeEventStore = async (params: { token: string; eventStoreId: string }) => {
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

  await eventStoreAdapter.unfreeze()
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': eventStoreId } = params

  try {
    await unfreezeEventStore({
      token,
      eventStoreId,
    })

    logger.success('Unfreeze event-store successfully completed!')
  } catch (error) {
    if (EventstoreAlreadyUnfrozenError.is(error)) {
      logger.error('EventStore is already unfrozen')
    } else {
      throw error
    }
  }
})

export const command = 'unfreeze <event-store-id>'
export const describe = chalk.green('unfreeze an event store on the cloud')
export const builder = (yargs: any) =>
  yargs.positional('event-store-id', {
    describe: chalk.green("an existing event store's id"),
    type: 'string',
  })
