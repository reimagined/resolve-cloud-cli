import createAdapter from '@resolve-js/eventstore-postgresql-serverless'

import { get } from '../api/client'
import { refreshToken } from '../api/auth'

const getAdapterWithCredentials = async (params: { eventStoreId: string }) => {
  const { eventStoreId } = params

  const token = await refreshToken()

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
