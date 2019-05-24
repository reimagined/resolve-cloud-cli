const columnify = require('columnify')
const yargs = require('yargs')
const { out } = require('../../../../../utils/std')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../../commands/sagas/properties/list')
const { get } = require('../../../../../api/client')
const refreshToken = require('../../../../../refreshToken')

jest.mock('../../../../../api/client', () => ({
  get: jest.fn()
}))
jest.mock('../../../../../utils/std', () => ({
  out: jest.fn()
}))
jest.mock('../../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { positional } = yargs

beforeAll(() => {
  get.mockResolvedValue({
    result: {
      property: 'property'
    }
  })
})

test('command', () => {
  expect(command).toEqual('list <deployment> <saga>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['ls', '$0'])
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledWith('saga', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    get.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    columnify.mockReturnValue('result-output')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      {
        property: 'property'
      },
      { minWidth: 30, columns: ['name', 'value'] }
    )
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id',
      saga: 'saga-name'
    })

    expect(get).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id/sagas/saga-name/properties'
    )
  })
})
