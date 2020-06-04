const yargs = require('yargs')
const {
  command,
  handler,
  builder,
  aliases,
  describe: commandDescription
} = require('../../../../commands/logs/get')
const { get } = require('../../../../api/client')
const { out } = require('../../../../utils/std')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  get: jest.fn(() => ({ result: 'logs-output' }))
}))

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../../utils/std', () => ({
  out: jest.fn()
}))

const { option, positional } = yargs

test('command', () => {
  expect(command).toEqual('get <deployment>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toContain('$0')
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(option).toHaveBeenCalledWith('start-time', {
    describe: expect.any(String),
    alias: 's',
    type: 'string'
  })
  expect(option).toHaveBeenCalledWith('end-time', {
    describe: expect.any(String),
    alias: 'e',
    type: 'string'
  })
  expect(option).toHaveBeenCalledWith('filter-pattern', {
    describe: expect.any(String),
    alias: 'f',
    type: 'string'
  })
  expect(option).toHaveBeenCalledWith('stream-limit', {
    describe: expect.any(String),
    alias: 'l',
    type: 'number'
  })
  expect(positional).toHaveBeenCalledTimes(1)
  expect(option).toHaveBeenCalledTimes(4)
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

    expect(out).toHaveBeenCalledWith('logs-output')
  })
  test('no output on null result', async () => {
    get.mockResolvedValueOnce({ result: null })

    await handler({ deployment: 'deployment-id' })

    expect(out).not.toHaveBeenCalled()
  })

  test('api call: no optional flags', async () => {
    await handler({ deployment: 'deployment-id' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {})
  })

  test('api call: startTime specified', async () => {
    await handler({ deployment: 'deployment-id', 'start-time': 'start-time' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {
      startTime: 'start-time'
    })
  })

  test('api call: endTime specified', async () => {
    await handler({ deployment: 'deployment-id', 'end-time': 'end-time' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {
      endTime: 'end-time'
    })
  })

  test('api call: filterPattern specified', async () => {
    await handler({ deployment: 'deployment-id', 'filter-pattern': 'filter-pattern' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {
      filterPattern: 'filter-pattern'
    })
  })

  test('api call: streamLimit specified', async () => {
    await handler({ deployment: 'deployment-id', 'stream-limit': 3 })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {
      streamLimit: 3
    })
  })
})
