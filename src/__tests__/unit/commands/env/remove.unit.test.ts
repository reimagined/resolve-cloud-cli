import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/env/remove'
import { del } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

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

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('remove <deployment-id> <variables...>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['rm'])
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment-id', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledWith('variables', {
    describe: expect.any(String),
    type: 'array',
  })
  expect(positional).toHaveBeenCalledTimes(2)
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
      deploymentId: 'deployment-id',
      variables: ['VAR_A', 'VAR_B'],
    })

    expect(del).toHaveBeenCalledWith('token', 'deployments/deployment-id/environment', {
      variables: ['VAR_A', 'VAR_B'],
    })
  })
})
