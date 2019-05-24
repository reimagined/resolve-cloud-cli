const yargs = require('yargs')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../../commands/sagas/properties/remove')
const { del } = require('../../../../../api/client')
const refreshToken = require('../../../../../refreshToken')

jest.mock('../../../../../api/client', () => ({
  del: jest.fn()
}))

jest.mock('../../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('remove <deployment> <saga> <name>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['rm'])
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
  expect(positional).toHaveBeenCalledWith('name', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledTimes(3)
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    del.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id',
      saga: 'saga-name',
      name: 'prop-name'
    })

    expect(del).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id/sagas/saga-name/properties/prop-name'
    )
  })
})
