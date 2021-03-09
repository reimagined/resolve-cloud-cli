import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  // handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/domains/verify'
import { post } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  post: jest.fn(),
}))
jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
jest.mock('querystring', () => ({
  escape: jest.fn(() => 'escaped-string'),
}))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('verify <id>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('id', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledTimes(1)
})

describe('handler', () => {
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(post).mockClear()
  })

  // test('wrapped with refreshToken', async () => {
  //   await handler({})
  //
  //   expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  // })
  //
  // test('api call', async () => {
  //   await handler({
  //     id: 'domain-id',
  //   })
  //
  //   expect(post).toHaveBeenCalledWith('token', 'domains/domain-id/verify', {})
  // })
})
