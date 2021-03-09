import columnify from 'columnify'
import { mocked } from 'ts-jest/utils'

import { out } from '../../../utils/std'
import {
  command,
  aliases,
  // handler,
  describe as commandDescription,
} from '../../../commands/list'
import { get } from '../../../api/client'
import refreshToken from '../../../refreshToken'

jest.mock('../../../api/client', () => ({
  get: jest.fn(),
}))
jest.mock('../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
jest.mock('../../../utils/std', () => ({
  out: jest.fn(),
}))

test('command', () => {
  expect(command).toEqual('list')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['ls'])
})

describe('handler', () => {
  beforeAll(() => {
    mocked(get).mockResolvedValue({
      result: [
        {
          deploymentId: 'deployment-id',
          version: '0.0.0',
          eventStoreId: 'event-store-id',
          applicationName: 'application-name',
        },
      ],
    })
  })

  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(get).mockClear()
    mocked(out).mockClear()
    mocked(columnify).mockClear()
  })

  // test('wrapped with refreshToken', async () => {
  //   await handler({})
  //
  //   expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  // })
  //
  // test('formatted output: up-to-date', async () => {
  //   mocked(columnify).mockReturnValue('result-output')
  //
  //   await handler({})
  //
  //   expect(columnify).toHaveBeenCalledWith(
  //     [
  //       {
  //         'application-name': 'application-name',
  //         'deployment-id': 'deployment-id',
  //         version: '0.0.0',
  //         'event-store-id': 'event-store-id',
  //       },
  //     ],
  //     {
  //       minWidth: 30,
  //       config: {
  //         version: { minWidth: 10 },
  //       },
  //       columns: ['application-name', 'deployment-id', 'version', 'event-store-id'],
  //     }
  //   )
  //   expect(out).toHaveBeenCalledWith('result-output')
  // })
  //
  // test('api call', async () => {
  //   await handler({})
  //
  //   expect(get).toHaveBeenCalledWith('token', '/deployments')
  // })
})
