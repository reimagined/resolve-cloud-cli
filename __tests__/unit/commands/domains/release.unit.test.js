const yargs = require('yargs')
const { escape } = require('querystring')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/domains/release')
const { post } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  post: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('querystring', () => ({
  escape: jest.fn(() => 'escaped-string')
}))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('release <domain>')
  expect(aliases).toEqual(expect.arrayContaining(['unbind']))
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
    escape.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      domain: 'custom-domain'
    })

    expect(escape).toHaveBeenCalledWith('custom-domain')
    expect(post).toHaveBeenCalledWith('token', 'domains/escaped-string/release', {})
  })
})
