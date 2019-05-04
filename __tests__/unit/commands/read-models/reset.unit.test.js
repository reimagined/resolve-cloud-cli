const yargs = require('yargs')
const {
  command,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/read-models/reset')
const { post } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  post: jest.fn()
}))

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('reset <deployment> <readmodel>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })

  expect(positional).toHaveBeenCalledWith('readmodel', {
    describe: expect.any(String),
    type: 'string'
  })
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
    await handler({ deployment: 'deployment-id', readmodel: 'read-model-name' })

    expect(post).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id/read-models/read-model-name/reset'
    )
  })
})
