import getAdapterWithCredentials from '../../../utils/get-adapter-with-credentials'
import { refreshToken } from '../../../api/auth'

jest.mock('@resolve-js/eventstore-postgresql-serverless', () => jest.fn())

jest.mock('../../../api/client', () => ({
  get: jest.fn(() => ({
    result: {
      region: 'region',
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      sessionToken: 'sessionToken',
      eventStoreSecretArn: 'eventStoreSecretArn',
      eventStoreClusterArn: 'eventStoreClusterArn',
      eventStoreDatabaseName: 'eventStoreDatabaseName',
    },
  })),
}))

jest.mock('../../../api/auth', () => ({
  refreshToken: jest.fn(),
}))

test('should call refreshToken', async () => {
  await getAdapterWithCredentials({ eventStoreId: 'event-store-id' })

  expect(refreshToken).toHaveBeenCalled()
})
