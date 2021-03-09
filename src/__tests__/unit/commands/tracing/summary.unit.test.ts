import yargs from 'yargs'
import dateFormat from 'dateformat'
import columnify from 'columnify'
import { mocked } from 'ts-jest/utils'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/tracing/summary'
import { get } from '../../../../api/client'
import { out } from '../../../../utils/std'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  get: jest.fn(() => ({
    result: [
      {
        Id: 'trace-5d1b0858-id',
        ResponseTime: 1,
        Http: {
          HttpURL: 'http://url',
        },
      },
    ],
  })),
}))

jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
jest.mock('../../../../utils/std', () => ({
  out: jest.fn(),
}))

jest.mock('../../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { option, positional } = yargs

test('command', () => {
  expect(command).toEqual('summary <deployment-id>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment-id', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledTimes(1)

  expect(option).toHaveBeenCalledWith('start-time', {
    describe: expect.any(String),
    alias: 's',
    type: 'string',
  })
  expect(option).toHaveBeenCalledWith('end-time', {
    describe: expect.any(String),
    alias: 'e',
    type: 'string',
  })
  expect(option).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(get).mockClear()
    mocked(out).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('console output', async () => {
    mocked(columnify).mockReturnValue('result-output')
    mocked(dateFormat).mockReturnValue('formatted-date')

    await handler({ deploymentId: 'deployment-id' })
    expect(columnify).toHaveBeenCalledWith(
      [{ id: 'trace-5d1b0858-id', latency: 1, time: 'formatted-date', url: 'http://url' }],
      { minWidth: 20, columns: ['time', 'id', 'latency', 'url'] }
    )
    expect(dateFormat).toHaveBeenCalledWith(new Date(1562052696000), expect.any(String))
  })

  test('api call: startTime specified', async () => {
    await handler({
      deploymentId: 'deployment-id',
      'start-time': 'start-time',
      'end-time': 'end-time',
    })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/tracing/summary', {
      startTime: 'start-time',
      endTime: 'end-time',
    })
  })
})
