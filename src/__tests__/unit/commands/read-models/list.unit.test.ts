import dateFormat from 'dateformat'
import columnify from 'columnify'
import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import { out } from '../../../../utils/std'
import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/read-models/list'
import { get } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  get: jest.fn(),
}))
jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
jest.mock('../../../../utils/std', () => ({
  out: jest.fn(),
}))
const version = '0.0.0'

jest.mock('../../../../config', () => ({
  getResolvePackageVersion: jest.fn(() => version),
}))

jest.mock('../../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { positional } = yargs

beforeAll(() => {
  mocked(get).mockResolvedValue({
    result: [
      {
        name: 'read-model-name',
        status: 'status',
        errors: [{ stack: 'error-message' }],
        successEvent: { type: 'event-type', timestamp: 100 },
      },
    ],
  })
})

test('command', () => {
  expect(command).toEqual('list <deployment-id>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['ls', '$0'])
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment-id', {
    describe: expect.any(String),
    type: 'string',
  })

  expect(positional).toHaveBeenCalledTimes(1)
})

describe('handler', () => {
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(get).mockClear()
    mocked(dateFormat).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    mocked(columnify).mockReturnValue('result-output')
    mocked(dateFormat).mockReturnValue('formatted-date')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      [
        {
          name: 'read-model-name',
          status: 'status',
          'last event': 'formatted-date event-type',
          'last error': 'error-message',
        },
      ],
      { minWidth: 30, maxWidth: 100, columns: ['name', 'status', 'last event', 'last error'] }
    )
    expect(dateFormat).toHaveBeenCalledWith(new Date(100), expect.any(String))
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('api call', async () => {
    await handler({ deploymentId: 'deployment-id' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/read-models', {})
  })
})
