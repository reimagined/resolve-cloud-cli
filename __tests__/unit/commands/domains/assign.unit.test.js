const yargs = require('yargs')
const { escape } = require('querystring')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/domains/assign')
const { post, get } = require('../../../../api/client')
const { out } = require('../../../../utils/std')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  post: jest.fn(),
  get: jest.fn()
}))
jest.mock('../../../../utils/std', () => ({
  out: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('querystring', () => ({
  escape: jest.fn(() => 'escaped-string')
}))

const { positional, option } = yargs

test('command', () => {
  expect(command).toEqual('assign <name> <deployment>')
  expect(aliases).toEqual(expect.arrayContaining(['bind']))
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('name', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledTimes(2)

  expect(option).toHaveBeenCalledWith('certificate', {
    alias: 'cert',
    describe: expect.any(String),
    type: 'string'
  })
  expect(option).toHaveBeenCalledTimes(1)
})

describe('handler', () => {
  beforeAll(() => {
    get.mockResolvedValue({
      result: {
        bindings: {
          'sub.root.org': {
            cname: 'cname-record-value'
          }
        }
      }
    })
  })

  afterEach(() => {
    refreshToken.mockClear()
    post.mockClear()
    escape.mockClear()
    get.mockClear()
    out.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({
      name: 'sub.root.org',
      deployment: 'existing-deployment',
      certificate: 'certificate-id'
    })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      name: 'sub.root.org',
      deployment: 'existing-deployment',
      certificate: 'certificate-id'
    })

    expect(escape).toHaveBeenCalledWith('root.org')
    expect(post).toHaveBeenCalledWith('token', 'domains/escaped-string/assign', {
      subdomain: 'sub',
      deploymentId: 'existing-deployment',
      certificateId: 'certificate-id'
    })
  })

  test('output', async () => {
    await handler({
      name: 'sub.root.org',
      deployment: 'existing-deployment',
      certificate: 'certificate-id'
    })

    expect(get).toHaveBeenCalledWith('token', 'domains/escaped-string')
    expect(out).toHaveBeenCalledWith(expect.stringContaining('cname-record-value'))
  })

  test('invalid name: not a domain at all', async () => {
    await expect(
      handler({
        name: 'not-a-domain',
        deployment: 'existing-deployment',
        certificate: 'certificate-id'
      })
    ).rejects.toBeInstanceOf(Error)
  })

  test('invalid name: no subdomain specifier', async () => {
    await expect(
      handler({
        name: 'root.org',
        deployment: 'existing-deployment',
        certificate: 'certificate-id'
      })
    ).rejects.toBeInstanceOf(Error)
  })

  test('invalid name: no subdomain specifier', async () => {
    await expect(
      handler({
        name: 'root.org',
        deployment: 'existing-deployment',
        certificate: 'certificate-id'
      })
    ).rejects.toBeInstanceOf(Error)
  })

  test('invalid name: unknown top-level domain', async () => {
    await expect(
      handler({
        name: 'sub.root.unk',
        deployment: 'existing-deployment',
        certificate: 'certificate-id'
      })
    ).rejects.toBeInstanceOf(Error)
  })
})
