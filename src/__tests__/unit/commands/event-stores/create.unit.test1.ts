import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import { post } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/event-stores/create'
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

const { option } = yargs

test('command', () => {
  expect(command).toEqual('create')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(option).toHaveBeenCalledWith('import-from', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(option).toHaveBeenCalledWith('format', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(option).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  beforeAll(() => {
    mocked(post).mockResolvedValue({
      result: {
        eventStoreId: 'event-store-id',
      },
    })
  })

  afterEach(() => {
    mocked(refreshToken).mockClear()
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
