import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/sagas/reset'
import { patch } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  patch: jest.fn(),
}))

jest.mock('../../../../refreshToken', () =>
  jest.fn(
    (h: any) =>
      (...args: Array<any>) =>
        h('token', ...args)
  )
)
const version = '0.0.0'

jest.mock('../../../../config', () => ({
  getResolvePackageVersion: jest.fn(() => version),
}))

jest.mock('../../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('reset <deployment-id> <saga>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment-id', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledWith('saga', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(patch).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({ deploymentId: 'deployment-id', saga: 'saga-name' })

    expect(patch).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id/sagas/saga-name/reset',
      {}
    )
  })
})
