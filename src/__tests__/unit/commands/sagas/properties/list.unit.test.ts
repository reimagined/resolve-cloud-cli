import columnify from 'columnify'
import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import { out } from '../../../../../utils/std'
import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../../commands/sagas/properties/list'
import { get } from '../../../../../api/client'
import refreshToken from '../../../../../refreshToken'

jest.mock('../../../../../api/client', () => ({
  get: jest.fn(),
}))
jest.mock('../../../../../utils/std', () => ({
  out: jest.fn(),
}))
jest.mock('../../../../../refreshToken', () =>
  jest.fn(
    (h: any) =>
      (...args: Array<any>) =>
        h('token', ...args)
  )
)

const version = '0.0.0'

jest.mock('../../../../../config', () => ({
  getResolvePackageVersion: jest.fn(() => version),
}))

jest.mock('../../../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { positional } = yargs

beforeAll(() => {
  mocked(get).mockResolvedValue({
    result: {
      property: 'property',
    },
  })
})

test('command', () => {
  expect(command).toEqual('list <deployment-id> <saga>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['ls', '$0'])
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
    mocked(get).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    mocked(columnify).mockReturnValue('result-output')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      {
        property: 'property',
      },
      { columns: ['name', 'value'], columnSplitter: '    ' }
    )
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('api call', async () => {
    await handler({
      deploymentId: 'deployment-id',
      saga: 'saga-name',
    })

    expect(get).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id/sagas/saga-name/properties',
      {}
    )
  })
})
