import { get } from '../api/client'
import createAdapter from '@resolve-js/eventstore-postgresql-serverless'

const getAdapterWithCredentials = async (params: { token: string; eventStoreId: string }) => {
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

  return createAdapter({
    databaseName: eventStoreDatabaseName,
    dbClusterOrInstanceArn: eventStoreClusterArn,
    awsSecretStoreArn: eventStoreSecretArn,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    region,
  })
}

export default getAdapterWithCredentials
