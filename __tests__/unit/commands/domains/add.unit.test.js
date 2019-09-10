const yargs = require('yargs')
const { escape } = require('querystring')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/domains/add')
const { post, get } = require('../../../../api/client')
const { out } = require('../../../../utils/std')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  post: jest.fn(),
  get: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../../utils/std', () => ({
  out: jest.fn()
}))
jest.mock('querystring', () => ({
  escape: jest.fn(() => 'escaped-string')
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
  beforeAll(() => {
    get.mockResolvedValue({
      result: {
        challenge: 'challenge-value',
        challengeRecordName: 'challenge-record-name'
      }
    })
  })

  afterEach(() => {
    refreshToken.mockClear()
    post.mockClear()
    get.mockClear()
    out.mockClear()
    escape.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({
      domain: 'domain.org'
    })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      domain: 'domain.org'
    })

    expect(post).toHaveBeenCalledWith('token', 'domains', {
      domain: 'domain.org'
    })
  })

  test('output', async () => {
    await handler({
      domain: 'root.org'
    })

    expect(escape).toHaveBeenCalledWith('root.org')
    expect(get).toHaveBeenCalledWith('token', 'domains/escaped-string')
    expect(out).toHaveBeenCalledWith(expect.stringContaining('challenge-value'))
    expect(out).toHaveBeenCalledWith(expect.stringContaining('challenge-record-name'))
  })

  test('output with default record name', async () => {
    get.mockResolvedValueOnce({
      result: {
        challenge: 'challenge-value'
      }
    })

    await handler({
      domain: 'root.org'
    })

    expect(out).toHaveBeenCalledWith(expect.stringContaining('_resolve-challenge'))
  })

  test('invalid name: not a domain at all', async () => {
    await expect(
      handler({
        domain: 'not-a-domain'
      })
    ).rejects.toBeInstanceOf(Error)
  })

  test('invalid name: subdomain specifier', async () => {
    await expect(
      handler({
        domain: 'sub.root.org'
      })
    ).rejects.toBeInstanceOf(Error)
  })

  test('invalid name: unknown top-level domain', async () => {
    await expect(
      handler({
        domain: 'root.unk'
      })
    ).rejects.toBeInstanceOf(Error)
  })
})
