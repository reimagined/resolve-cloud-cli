import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../commands/remove'
import { del, patch } from '../../../api/client'
import refreshToken from '../../../refreshToken'
import { HEADER_EXECUTION_MODE } from '../../../constants'

jest.mock('../../../api/client', () => ({
  del: jest.fn(),
  patch: jest.fn(),
}))
jest.mock('../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
const version = '0.0.0'

jest.mock('../../../config', () => ({
  getResolvePackageVersion: jest.fn(() => version),
}))
jest.mock('../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { option, positional } = yargs

test('command', () => {
  expect(command).toEqual('remove <deployment-id>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['rm'])
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment-id', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledTimes(1)

  expect(option).toHaveBeenCalledWith('with-event-store', {
    describe: expect.any(String),
    type: 'boolean',
    default: false,
  })
  expect(option).toHaveBeenCalledWith('wait', {
    describe: expect.any(String),
    type: 'boolean',
    default: true,
  })
  expect(option).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(del).mockClear()
    mocked(patch).mockClear()
    jest.clearAllTimers()
  })

  test('wrapped with refreshToken', async () => {
    await handler({
      deploymentId: 'deployment-id',
    })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      deploymentId: 'deployment-id',
    })

    expect(patch).toHaveBeenCalledWith('token', '/deployments/deployment-id/shutdown', undefined, {
      [HEADER_EXECUTION_MODE]: 'async',
    })

    expect(del).toHaveBeenCalledWith(
      'token',
      '/deployments/deployment-id',
      { withEventStore: undefined },
      { [HEADER_EXECUTION_MODE]: 'async' }
    )
  })

  test('api call with drop linked event-store', async () => {
    await handler({
      deploymentId: 'deployment-id',
      'with-event-store': true,
    })

    expect(del).toHaveBeenCalledWith(
      'token',
      '/deployments/deployment-id',
      {
        withEventStore: true,
      },
      { [HEADER_EXECUTION_MODE]: 'async' }
    )
  })
})
