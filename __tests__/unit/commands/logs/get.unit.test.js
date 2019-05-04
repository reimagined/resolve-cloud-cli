const yargs = require('yargs')
const {
  command,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/logs/get')
const { get } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  get: jest.fn()
}))

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { option, positional } = yargs

test('command', () => {
  expect(command).toEqual('get <deployment>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })

  expect(option).toHaveBeenCalledWith('startTime', {
    describe: expect.any(String),
    alias: 's',
    type: 'string'
  })

  expect(option).toHaveBeenCalledWith('endTime', {
    describe: expect.any(String),
    alias: 'e',
    type: 'string'
  })

  expect(option).toHaveBeenCalledWith('filterPattern', {
    describe: expect.any(String),
    alias: 'f',
    type: 'string'
  })

  expect(option).toHaveBeenCalledWith('streamLimit', {
    describe: expect.any(String),
    alias: 'l',
    type: 'number'
  })
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

  test('api call: no optional flags', async () => {
    await handler({ deployment: 'deployment-id' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {})
  })

  test('api call: startTime specified', async () => {
    await handler({ deployment: 'deployment-id', startTime: 'start-time' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {
      startTime: 'start-time'
    })
  })

  test('api call: endTime specified', async () => {
    await handler({ deployment: 'deployment-id', endTime: 'end-time' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {
      endTime: 'end-time'
    })
  })

  test('api call: filterPattern specified', async () => {
    await handler({ deployment: 'deployment-id', filterPattern: 'filter-pattern' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {
      filterPattern: 'filter-pattern'
    })
  })

  test('api call: streamLimit specified', async () => {
    await handler({ deployment: 'deployment-id', streamLimit: 3 })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/logs', {
      streamLimit: 3
    })
  })
})
