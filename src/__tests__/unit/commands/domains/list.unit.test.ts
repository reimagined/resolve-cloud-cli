import dateFormat from 'dateformat'
// import columnify from 'columnify'
import { mocked } from 'ts-jest/utils'

import { out } from '../../../../utils/std'
import {
  command,
  aliases,
  // handler,
  describe as commandDescription,
} from '../../../../commands/domains/list'
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

const dateAdded = 1546304461000

beforeAll(() => {
  mocked(get).mockResolvedValue({
    result: [
      {
        domain: 'domain-name',
        addedAt: dateAdded,
        verified: true,
        bindings: {
          aliasA: {},
          aliasB: {},
        },
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
  })

  // test('wrapped with refreshToken', async () => {
  //   await handler({})
  //
  //   expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  // })
  //
  // test('formatted output', async () => {
  //   mocked(columnify).mockReturnValue('result-output')
  //   mocked(dateFormat).mockReturnValue('formatted-date')
  //
  //   await handler({})
  //
  //   expect(columnify).toHaveBeenCalledWith(
  //     [
  //       {
  //         domain: 'domain-name',
  //         'added at': 'formatted-date',
  //         verified: true,
  //         bindings: 'aliasA,aliasB',
  //       },
  //     ],
  //     expect.any(Object)
  //   )
  //   expect(dateFormat).toHaveBeenCalledWith(new Date(dateAdded), expect.any(String))
  //   expect(out).toHaveBeenCalledWith('result-output')
  // })
  //
  // test('api call', async () => {
  //   await handler({})
  //
  //   expect(get).toHaveBeenCalledWith('token', 'domains')
  // })
})
