import chalk from 'chalk'
import createAdapter from '@resolve-js/eventstore-postgresql-serverless'
import { EventstoreAlreadyFrozenError } from '@resolve-js/eventstore-base'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { logger } from '../../utils/std'

export const freezeEventStore = async (params: { token: string; eventStoreId: string }) => {
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

  await eventStoreAdapter.freeze()
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': eventStoreId } = params
  try {
    await freezeEventStore({
      token,
      eventStoreId,
    })

    logger.success('Freeze event-store successfully completed!')
  } catch (error) {
    if (EventstoreAlreadyFrozenError.is(error)) {
      logger.error('EventStore is already frozen')
    } else {
      throw error
    }
  }
})

export const command = 'freeze <event-store-id>'
export const describe = chalk.green('freeze an event store on the cloud')
export const builder = (yargs: any) =>
  yargs.positional('event-store-id', {
    describe: chalk.green("an existing event store's id"),
    type: 'string',
  })
