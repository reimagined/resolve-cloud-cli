const yargs = require('yargs')
const {
  command,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/tracing/get')
const { get } = require('../../../../api/client')
const { out } = require('../../../../utils/std')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  get: jest.fn(() => ({
    result: 'trace-output'
  }))
}))

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../../utils/std', () => ({
  out: jest.fn()
}))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('get <deployment> <traceId>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledWith('trace-id', {
    describe: expect.any(String),
    type: 'string'
  })

  expect(positional).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    get.mockClear()
    out.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('console output', async () => {
    await handler({ deployment: 'deployment-id' })

    expect(out).toHaveBeenCalledWith('"trace-output"')
  })

  test('api call', async () => {
    await handler({ deployment: 'deployment-id', 'trace-id': 'trace-id' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/tracing/details', {
      traceIds: 'trace-id'
    })
  })
})
