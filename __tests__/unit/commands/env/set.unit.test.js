const yargs = require('yargs')
const {
  command,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/env/set')
const { post } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  post: jest.fn()
}))

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('set <deployment> <variables...>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledWith('variables', {
    describe: expect.any(String),
    type: 'array'
  })
  expect(positional).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    post.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({ deployment: 'deployment-id', variables: ['VAR_A=var_a', 'VAR_B=var_b'] })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({ deployment: 'deployment-id', variables: ['VAR_A=var_a', 'VAR_B=var_b'] })

    expect(post).toHaveBeenCalledWith('token', 'deployments/deployment-id/environment', {
      variables: {
        VAR_A: 'var_a',
        VAR_B: 'var_b'
      }
    })
  })
})
