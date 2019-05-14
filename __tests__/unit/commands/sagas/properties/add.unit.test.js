const yargs = require('yargs')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../../commands/sagas/properties/add')
const { post } = require('../../../../../api/client')
const refreshToken = require('../../../../../refreshToken')

jest.mock('../../../../../api/client', () => ({
  post: jest.fn()
}))

jest.mock('../../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('add <deployment> <saga> <key> <value>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['create'])
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
  expect(positional).toHaveBeenCalledWith('value', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledTimes(4)
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    post.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id',
      saga: 'saga-name',
      key: 'prop-name',
      value: 'prop-value'
    })

    expect(post).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id/sagas/saga-name/properties',
      {
        key: 'prop-name',
        value: 'prop-value'
      }
    )
  })
})
