import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/env/set'
import { put } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  put: jest.fn(),
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
  expect(command).toEqual('set <deployment-id> <variables...>')
  expect(commandDescription).toEqual(expect.any(String))
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
    mocked(put).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({ deploymentId: 'deployment-id', variables: ['VAR_A=var_a', 'VAR_B=var_b'] })

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({ deploymentId: 'deployment-id', variables: ['VAR_A=var_a', 'VAR_B=var_b'] })

    expect(put).toHaveBeenCalledWith('token', 'deployments/deployment-id/environment', {
      variables: {
        VAR_A: 'var_a',
        VAR_B: 'var_b',
      },
    })
  })
})
