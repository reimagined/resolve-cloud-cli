import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'
import { executeStatement } from 'resolve-cloud-common/postgres'

import { patch } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/event-stores/clone'

import { HEADER_EXECUTION_MODE } from '../../../../constants'

jest.mock('../../../../api/client', () => ({
  patch: jest.fn(),
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
    mocked(patch).mockResolvedValue({
      result: {
        eventStoreId: 'event-store-id',
      },
    })
    mocked(executeStatement).mockResolvedValue([])
  })

  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(patch).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('calls post with event store options', async () => {
    await handler({
      'event-store-id': 'event-store-id',
    })

    expect(patch).toBeCalledWith('token', `/event-stores/event-store-id/clone`, undefined, {
      [HEADER_EXECUTION_MODE]: 'async',
    })
  })
})
