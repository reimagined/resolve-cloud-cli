import yargs from 'yargs'
import { Writable, Readable } from 'stream'
import { mocked } from 'ts-jest/utils'
import { executeStatement } from 'resolve-cloud-common/postgres'

import { get } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/event-stores/import'

jest.mock('path')

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  statSync: jest.fn(() => ({
    size: 0,
  })),
  createReadStream: jest.fn().mockImplementation(() =>
    Readable.from(
      (async function* stream() {
        await new Promise((resolve) => setImmediate(resolve))
        yield 'test'
      })()
    )
  ),
}))

jest.mock('../../../../api/client', () => ({
  get: jest.fn(),
}))
jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)

const importEvents = jest.fn()
const importSecrets = jest.fn()

jest.mock('../../../../utils/get-adapter-with-credentials', () =>
  jest.fn(() => ({
    init: jest.fn(),
    importEvents: importEvents.mockImplementation(() => {
      const stream = new Writable({
        write(chunk, encoding, callback) {
          setImmediate(callback)
        },
      }) as any
      stream.byteOffset = Number.MAX_SAFE_INTEGER
      return stream
    }),
    importSecrets: importSecrets.mockImplementation(
      () =>
        new Writable({
          write(chunk, encoding, callback) {
            setImmediate(callback)
          },
        })
    ),
  }))
)
const version = '0.0.0'

jest.mock('../../../../config', () => ({
  getResolvePackageVersion: jest.fn(() => version),
}))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('import <event-store-id> <path>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('event-store-id', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledWith('path', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledTimes(2)
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
    mocked(executeStatement).mockResolvedValue([])
  })

  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(get).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({
      'event-store-id': 'event-store-id',
      path: 'path',
    })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('calls import events/secrets', async () => {
    await handler({
      'event-store-id': 'event-store-id',
      path: 'path',
    })

    expect(importEvents).toBeCalled()
    expect(importSecrets).toBeCalled()
  })
})
