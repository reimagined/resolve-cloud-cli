import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../../commands/sagas/properties/set'
import { put } from '../../../../../api/client'
import refreshToken from '../../../../../refreshToken'

jest.mock('../../../../../api/client', () => ({
  put: jest.fn(),
}))

jest.mock('../../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)

const version = '0.0.0'

jest.mock('../../../../../config', () => ({
  getResolvePackageVersion: jest.fn(() => version),
}))

jest.mock('../../../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('set <deployment-id> <saga> <property> <value>')
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
  expect(positional).toHaveBeenCalledWith('property', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledWith('value', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledTimes(4)
})

describe('handler', () => {
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(put).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      deploymentId: 'deployment-id',
      saga: 'saga-name',
      property: 'prop-name',
      value: 'prop-value',
    })

    expect(put).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id/sagas/saga-name/properties',
      {
        key: 'prop-name',
        value: 'prop-value',
      }
    )
  })
})
