import yargs from 'yargs'
import { Writable, Readable } from 'stream'
import { mocked } from 'ts-jest/utils'
import { executeStatement } from 'resolve-cloud-common/postgres'

import { get, patch } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/event-stores/import'
import { HEADER_EXECUTION_MODE } from '../../../../constants'

jest.mock('path', () => ({
  resolve: jest.fn((path) => path),
}))

jest.mock('fs', () => ({
  unlinkSync: jest.fn(),
  existsSync: jest.fn(() => true),
  statSync: jest.fn(() => ({
    size: 0,
  })),
  createReadStream: jest.fn().mockImplementation(() =>
    Readable.from(
      (async function* stream() {
        await new Promise((resolve) => setImmediate(resolve))
        yield '{"id":"id","secret":"secret"}'
      })()
    )
  ),
  createWriteStream: jest.fn().mockImplementation(
    () =>
      new Writable({
        write(chunk, encoding, callback) {
          setImmediate(callback)
        },
      })
  ),
}))

jest.mock('../../../../api/client', () => ({
  get: jest.fn(),
  patch: jest.fn(),
}))
jest.mock('../../../../refreshToken', () =>
  jest.fn(
    (h: any) =>
      (...args: Array<any>) =>
        h('token', ...args)
  )
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
        eventsImportUrls: [],
        secretsImportUrls: [],
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
      path: './path',
    })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('calls post and patch with options', async () => {
    await handler({
      'event-store-id': 'event-store-id',
      path: './path',
    })

    expect(get).toHaveBeenCalledWith('token', `/event-stores/event-store-id/import`, {
      eventsPartCount: 1,
      secretsPartCount: 1,
    })
    expect(patch).toHaveBeenCalledWith(
      'token',
      `/event-stores/event-store-id/import`,
      { partIndex: 0 },
      { [HEADER_EXECUTION_MODE]: 'async' }
    )
  })
})
