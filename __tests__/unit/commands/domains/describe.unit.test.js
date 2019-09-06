const { escape } = require('querystring')
const dateFormat = require('dateformat')
const columnify = require('columnify')
const { out } = require('../../../../utils/std')
const {
  command,
  aliases,
  handler,
  describe: commandDescription
} = require('../../../../commands/domains/describe')
const { get } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  get: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../../utils/std', () => ({
  out: jest.fn()
}))
jest.mock('querystring', () => ({
  escape: jest.fn(() => 'escaped-string')
}))

const dateAdded = '2019-01-01T01:01:01.000Z'

beforeAll(() => {
  get.mockResolvedValue({
    result: {
      domain: 'domain-within-response',
      verified: false,
      challenge: 'verification-challenge',
      addedAt: dateAdded,
      bindings: {
        aliasA: {
          deploymentId: 'alias-deployment-id-a',
          certificateId: 'alias-certificate-id-a',
          cname: 'alias-cname-a'
        },
        aliasB: {
          deploymentId: 'alias-deployment-id-b',
          certificateId: 'alias-certificate-id-b',
          cname: 'alias-cname-b'
        }
      }
    }
  })
})

test('command', () => {
  expect(command).toEqual('describe <domain>')
  expect(aliases).toEqual(expect.arrayContaining(['get']))
  expect(commandDescription).toEqual(expect.any(String))
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    get.mockClear()
    dateFormat.mockClear()
    out.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({ domain: 'domain-to-describe' })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    columnify.mockReturnValue('result-output')
    dateFormat.mockReturnValue('formatted-date')

    await handler({ domain: 'domain-to-describe' })

    expect(columnify).toHaveBeenCalledWith(
      {
        domain: 'domain-within-response',
        verified: false,
        addedAt: 'formatted-date',
        challenge: 'verification-challenge'
      },
      expect.any(Object)
    )
    expect(dateFormat).toHaveBeenCalledWith(new Date(dateAdded), expect.any(String))
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('formatted bindings output', async () => {
    await handler({ domain: 'domain-to-describe' })

    expect(columnify).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          alias: 'aliasA',
          cname: 'alias-cname-a',
          deployment: 'alias-deployment-id-a',
          certificate: 'alias-certificate-id-a'
        },
        {
          alias: 'aliasB',
          cname: 'alias-cname-b',
          deployment: 'alias-deployment-id-b',
          certificate: 'alias-certificate-id-b'
        }
      ]),
      expect.any(Object)
    )
  })

  test('hide challenge for a verified domain', async () => {
    get.mockResolvedValueOnce({
      result: {
        domain: 'domain-within-response',
        verified: true,
        challenge: 'verification-challenge',
        addedAt: dateAdded,
        bindings: {
          aliasA: {
            deploymentId: 'alias-deployment-id'
          }
        }
      }
    })

    await handler({ domain: 'domain-to-describe' })

    expect(columnify).toHaveBeenCalledWith(
      expect.objectContaining({
        challenge: 'completed'
      }),
      expect.any(Object)
    )
  })

  test('api call', async () => {
    await handler({ domain: 'domain-to-describe' })

    expect(escape).toHaveBeenCalledWith('domain-to-describe')
    expect(get).toHaveBeenCalledWith('token', `domains/escaped-string`)
  })
})
