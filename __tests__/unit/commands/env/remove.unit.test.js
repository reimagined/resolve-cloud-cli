const yargs = require('yargs')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/env/remove')
const { del } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  del: jest.fn()
}))

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('remove <deployment> <variables...>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['rm'])
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
    del.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id',
      variables: ['VAR_A', 'VAR_B']
    })

    expect(del).toHaveBeenCalledWith('token', 'deployments/deployment-id/environment', {
      variables: ['VAR_A', 'VAR_B']
    })
  })
})
