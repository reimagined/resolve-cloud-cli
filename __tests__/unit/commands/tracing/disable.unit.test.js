const yargs = require('yargs')
const {
  command,
  handler,
  builder,
  aliases,
  describe: commandDescription
} = require('../../../../commands/tracing/disable')
const { post } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  post: jest.fn()
}))

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { positional } = yargs

beforeAll(() => {
  post.mockResolvedValue({
    result: null
  })
})

test('command', () => {
  expect(command).toEqual('disable <deployment>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual([])
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
    post.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({ deployment: 'deployment-id' })

    expect(post).toHaveBeenCalledWith('token', 'deployments/deployment-id/tracing/disable')
  })
})
