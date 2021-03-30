import columnify from 'columnify'
import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'
import { HEADER_EXECUTION_MODE } from '../../../../constants'

import { formatEvent, out } from '../../../../utils/std'
import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/sagas/list'
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
  formatEvent: jest.fn((event) =>
    event ? `${event.type !== 'Init' ? 'formatted-date' : ''} ${event.type}` : 'N\\A'
  ),
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
        name: 'saga-name',
        status: 'status',
        successEvent: { type: 'event-type', timestamp: 100 },
        failedEvent: { type: 'event-type', timestamp: 100 },
        errors: [{ stack: 'error-message' }],
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
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    mocked(columnify).mockReturnValue('result-output')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      [
        {
          name: 'saga-name',
          status: 'status',
          'success event': 'formatted-date event-type',
          'failed event': 'formatted-date event-type',
          'last error': 'error-message',
        },
      ],
      expect.any(Object)
    )
    expect(formatEvent).toHaveBeenCalledWith(expect.any(Object))
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('api call', async () => {
    await handler({ deploymentId: 'deployment-id' })

    expect(get).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id/sagas',
      {},
      { [HEADER_EXECUTION_MODE]: 'async' }
    )
  })
})
