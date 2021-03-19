import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'
import { executeStatement } from 'resolve-cloud-common/postgres'

import { post, get } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/event-stores/clone'

import { HEADER_EXECUTION_MODE } from '../../../../constants'

jest.mock('fs')
jest.mock('../../../../api/client', () => ({
  post: jest.fn(),
  get: jest.fn(),
}))
jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
const version = '0.0.0'

jest.mock('../../../../config', () => ({
  getResolvePackageVersion: jest.fn(() => version),
}))

const { option, positional } = yargs

test('command', () => {
  expect(command).toEqual('clone <event-store-id>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('event-store-id', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(option).toHaveBeenCalledWith('format', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledTimes(1)
  expect(option).toHaveBeenCalledTimes(1)
})

describe('handler', () => {
  beforeAll(() => {
    mocked(get).mockResolvedValue({
      result: {
        region: 'region',
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        sessionToken: 'sessionToken',
        eventStoreSecretArn: 'eventStoreSecretArn',
        eventStoreClusterArn: 'eventStoreClusterArn',
        eventStoreDatabaseName: 'eventStoreDatabaseName',
      },
    })
    mocked(post).mockResolvedValue({
      result: {
        eventStoreId: 'event-store-id',
      },
    })
    mocked(executeStatement).mockResolvedValue([])
  })

  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(get).mockClear()
    mocked(post).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('calls post with event store options', async () => {
    await handler({})

    expect(post).toBeCalledWith(
      'token',
      `/event-stores`,
      { version },
      { [HEADER_EXECUTION_MODE]: 'async' }
    )
  })
})
