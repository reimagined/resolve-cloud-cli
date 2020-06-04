const yargs = require('yargs')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../commands/remove')
const { del, get } = require('../../../api/client')
const refreshToken = require('../../../refreshToken')

jest.mock('../../../api/client', () => ({
  del: jest.fn(),
  get: jest.fn()
}))
jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../constants', () => ({
  DEPLOYMENT_STATE_AWAIT_INTERVAL_MS: 1
}))

const { positional, option } = yargs

test('command', () => {
  expect(command).toEqual('remove <deployment>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['rm'])
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledTimes(1)
  expect(option).toHaveBeenCalledWith('no-wait', {
    describe: expect.any(String),
    type: 'boolean',
    default: false
  })
  expect(option).toHaveBeenCalledTimes(1)
})

describe('handler', () => {
  let routesGet

  beforeAll(() => {
    get.mockImplementation((_, route, ...args) =>
      Promise.resolve({
        result: routesGet[route](...args)
      })
    )
  })

  beforeEach(() => {
    routesGet = {
      'deployments/deployment-id': () => ({ status: 'destroyed' })
    }
  })

  afterEach(() => {
    refreshToken.mockClear()
    del.mockClear()
    get.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({
      deployment: 'deployment-id'
    })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id'
    })

    expect(del).toHaveBeenCalledWith('token', 'deployments/deployment-id')
  })

  test('awaiting for deployment destroyed', async () => {
    const statuses = ['destroying', 'destroyed']

    routesGet['deployments/deployment-id'] = () => ({ status: statuses.shift() })

    await handler({
      deployment: 'deployment-id'
    })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id')
  })

  test('bug: awaiting for deployment destroyed only two iterations', async () => {
    const statuses = ['destroying', 'destroying', 'destroyed']

    const proxy = jest.fn(() => ({ status: statuses.shift() }))

    routesGet['deployments/deployment-id'] = proxy

    await handler({
      deployment: 'deployment-id'
    })

    expect(proxy).toHaveBeenCalledTimes(3)
  })

  test('option: noWait', async () => {
    await handler({ 'no-wait': true })

    expect(get).not.toHaveBeenCalledWith('token', 'deployments/deployment-id')
  })
})
