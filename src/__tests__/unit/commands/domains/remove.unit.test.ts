import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/domains/remove'
import { del } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'
import { HEADER_EXECUTION_MODE } from '../../../../constants'

jest.mock('../../../../api/client', () => ({
  del: jest.fn(),
}))
jest.mock('../../../../refreshToken', () =>
  jest.fn(
    (h: any) =>
      (...args: Array<any>) =>
        h('token', ...args)
  )
)
jest.mock('querystring', () => ({
  escape: jest.fn(() => 'escaped-string'),
}))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('remove <id>')
  expect(aliases).toEqual(expect.arrayContaining(['drop', 'delete', 'rm']))
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
    mocked(del).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      id: 'domain-id',
    })

    expect(del).toHaveBeenCalledWith('token', 'domains/domain-id', undefined, {
      [HEADER_EXECUTION_MODE]: 'async',
    })
  })
})
