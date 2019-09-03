const yargs = require('yargs')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/domains/add')
const { post } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  post: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('util', () => ({
  promisify: fn => fn
}))
jest.mock('fs', () => ({
  readFile: jest.fn(name => name)
}))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('add <domain>')
  expect(aliases).toEqual(expect.arrayContaining(['register']))
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('domain', {
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
    await handler({
      domain: 'custom-domain'
    })

    expect(post).toHaveBeenCalledWith('token', 'domains', {
      domain: 'custom-domain'
    })
  })
})
