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
  expect(command).toEqual('release <name>')
  expect(aliases).toEqual(expect.arrayContaining(['unbind']))
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('name', {
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
    await handler({
      name: 'sub.root.org'
    })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      name: 'sub.root.org'
    })

    expect(escape).toHaveBeenCalledWith('root.org')
    expect(post).toHaveBeenCalledWith('token', 'domains/escaped-string/release', {
      subdomain: 'sub'
    })
  })

  test('invalid name: not a domain at all', async () => {
    await expect(
      handler({
        name: 'not-a-domain'
      })
    ).rejects.toBeInstanceOf(Error)
  })

  test('invalid name: no subdomain specifier', async () => {
    await expect(
      handler({
        name: 'root.org'
      })
    ).rejects.toBeInstanceOf(Error)
  })

  test('invalid name: no subdomain specifier', async () => {
    await expect(
      handler({
        name: 'root.org'
      })
    ).rejects.toBeInstanceOf(Error)
  })

  test('invalid name: unknown top-level domain', async () => {
    await expect(
      handler({
        name: 'sub.root.unk'
      })
    ).rejects.toBeInstanceOf(Error)
  })
})
