const dateFormat = require('dateformat')
const columnify = require('columnify')
const yargs = require('yargs')
const { out } = require('../../../../utils/std')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/read-models/list')
const { get } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  get: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../../utils/std', () => ({
  out: jest.fn()
}))

const { positional } = yargs

beforeAll(() => {
  get.mockResolvedValue({
    result: [
      {
        name: 'read-model-name',
        status: 'status',
        lastEvent: { type: 'event-type', timestamp: 100 },
        lastError: { message: 'error-message' }
      }
    ]
  })
})

test('command', () => {
  expect(command).toEqual('list <deployment>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['ls', '$0'])
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledTimes(1)
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    get.mockClear()
    dateFormat.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    columnify.mockReturnValue('result-output')
    dateFormat.mockReturnValue('formatted-date')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      [
        {
          name: 'read-model-name',
          status: 'status',
          'last event': 'formatted-date event-type',
          'last error': 'error-message'
        }
      ],
      { minWidth: 30, columns: ['name', 'status', 'last event', 'last error'] }
    )
    expect(dateFormat).toHaveBeenCalledWith(new Date(100), expect.any(String))
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('api call', async () => {
    await handler({ deployment: 'deployment-id' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/read-models')
  })
})
