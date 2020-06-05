const dateFormat = require('dateformat')
const columnify = require('columnify')
const { out } = require('../../../../utils/std')
const {
  command,
  aliases,
  handler,
  describe: commandDescription
} = require('../../../../commands/certificates/list')
const { get } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  get: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../../utils/std', () => ({
  out: jest.fn()
}))

const dateImported = '2019-01-01T01:01:01.000Z'
const dateNotBefore = '2019-01-02T01:01:01.000Z'
const dateNotAfter = '2019-01-03T01:01:01.000Z'

beforeAll(() => {
  get.mockResolvedValue({
    result: [
      {
        id: 'certificate-id',
        domainName: 'domain-name',
        additionalNames: ['additional-name-1', 'additional-name-2'],
        importedAt: dateImported,
        notBefore: dateNotBefore,
        notAfter: dateNotAfter,
        issuer: 'certificate-issuer'
      }
    ]
  })
})

test('command', () => {
  expect(command).toEqual('list')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['ls', '$0'])
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    get.mockClear()
    dateFormat.mockClear()
    out.mockClear()
    columnify.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    columnify.mockReturnValue('result-output')
    dateFormat.mockReturnValue('formatted-date')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      [
        {
          id: 'certificate-id',
          issuer: 'certificate-issuer',
          imported: 'formatted-date',
          'domain name': 'domain-name',
          'additional names': 'additional-name-1, additional-name-2',
          'not before': 'formatted-date',
          'not after': 'formatted-date'
        }
      ],
      expect.any(Object)
    )
    expect(dateFormat).toHaveBeenCalledWith(new Date(dateImported), expect.any(String))
    expect(dateFormat).toHaveBeenCalledWith(new Date(dateNotBefore), expect.any(String))
    expect(dateFormat).toHaveBeenCalledWith(new Date(dateNotAfter), expect.any(String))
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('formatted output if dates are absent', async () => {
    get.mockResolvedValueOnce({
      result: [
        {
          id: 'certificate-id',
          domainName: 'domain-name',
          additionalNames: ['additional-name-1', 'additional-name-2'],
          issuer: 'certificate-issuer'
        }
      ]
    })

    columnify.mockReturnValue('result-output')
    dateFormat.mockReturnValue('formatted-date')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      [
        {
          id: 'certificate-id',
          issuer: 'certificate-issuer',
          'domain name': 'domain-name',
          'additional names': 'additional-name-1, additional-name-2',
          imported: 'N/A',
          'not before': 'N/A',
          'not after': 'N/A'
        }
      ],
      expect.any(Object)
    )
    expect(dateFormat).toHaveBeenCalledTimes(0)
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('api call', async () => {
    await handler({})

    expect(get).toHaveBeenCalledWith('token', 'certificates')
  })
})
