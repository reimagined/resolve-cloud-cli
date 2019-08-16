const columnify = require('columnify')
const yargs = require('yargs')
const { out } = require('../../../utils/std')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../commands/describe')
const { get } = require('../../../api/client')
const refreshToken = require('../../../refreshToken')

jest.mock('../../../api/client', () => ({
  get: jest.fn()
}))

jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../utils/std', () => ({
  out: jest.fn()
}))

const { positional } = yargs

beforeAll(() => {
  get.mockResolvedValue({
    result: {
      data: 'data',
      error: 'error'
    }
  })
})

test('command', () => {
  expect(command).toEqual('describe <deployment>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['get'])
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
    out.mockClear()
    columnify.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    columnify.mockReturnValue('result-output')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      { data: 'data', error: 'error' },
      { minWidth: 20, showHeaders: false }
    )
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('print "not available" if no error returned', async () => {
    get.mockResolvedValueOnce({
      result: {
        data: 'data',
        error: undefined
      }
    })

    await handler({})

    expect(columnify).toHaveBeenCalledWith({ data: 'data', error: 'N\\A' }, expect.anything())
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id'
    })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id')
  })
})
