import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  handler,
  builder,
  aliases,
  describe as commandDescription,
} from '../../../../commands/certificates/remove'
import { del } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'
import { HEADER_EXECUTION_MODE } from '../../../../constants'

jest.mock('../../../../api/client', () => ({
  del: jest.fn(),
}))

jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('remove <id>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['drop', 'delete', 'rm'])
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
    await handler({ id: 'certificate-id' })

    expect(del).toHaveBeenCalledWith('token', 'certificates/certificate-id', undefined, {
      [HEADER_EXECUTION_MODE]: 'async',
    })
  })
})
