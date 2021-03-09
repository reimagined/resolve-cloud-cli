import dateFormat from 'dateformat'
import columnify from 'columnify'
import { mocked } from 'ts-jest/utils'

import { out } from '../../../../utils/std'
import {
  command,
  aliases,
  handler,
  describe as commandDescription,
} from '../../../../commands/certificates/list'
import { get } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  get: jest.fn(),
}))
jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
jest.mock('../../../../utils/std', () => ({
  out: jest.fn(),
}))

const dateImported = '2019-01-01T01:01:01.000Z'
const dateNotBefore = '2019-01-02T01:01:01.000Z'
const dateNotAfter = '2019-01-03T01:01:01.000Z'

beforeAll(() => {
  mocked(get).mockResolvedValue({
    result: [
      {
        CertificateId: 'certificate-id',
        DomainName: 'domain-name',
        AdditionalNames: ['additional-name-1', 'additional-name-2'],
        Issuer: 'certificate-issuer',
        ImportedAt: dateImported,
        NotBefore: dateNotBefore,
        NotAfter: dateNotAfter,
      },
    ],
  })
})

test('command', () => {
  expect(command).toEqual('list')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['ls', '$0'])
})

describe('handler', () => {
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(get).mockClear()
    mocked(dateFormat).mockClear()
    mocked(out).mockClear()
    mocked(columnify).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    mocked(columnify).mockReturnValue('result-output')
    mocked(dateFormat).mockReturnValue('formatted-date')

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
          'not after': 'formatted-date',
        },
      ],
      expect.any(Object)
    )
    expect(dateFormat).toHaveBeenCalledWith(new Date(dateImported), expect.any(String))
    expect(dateFormat).toHaveBeenCalledWith(new Date(dateNotBefore), expect.any(String))
    expect(dateFormat).toHaveBeenCalledWith(new Date(dateNotAfter), expect.any(String))
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('formatted output if dates are absent', async () => {
    mocked(get).mockResolvedValueOnce({
      result: [
        {
          CertificateId: 'certificate-id',
          DomainName: 'domain-name',
          AdditionalNames: ['additional-name-1', 'additional-name-2'],
          Issuer: 'certificate-issuer',
        },
      ],
    })

    mocked(columnify).mockReturnValue('result-output')
    mocked(dateFormat).mockReturnValue('formatted-date')

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
          'not after': 'N/A',
        },
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
