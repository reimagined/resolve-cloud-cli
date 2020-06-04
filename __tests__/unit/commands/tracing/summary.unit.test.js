const yargs = require('yargs')
const dateFormat = require('dateformat')
const columnify = require('columnify')
const {
  command,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/tracing/summary')
const { get } = require('../../../../api/client')
const { out } = require('../../../../utils/std')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  get: jest.fn(() => ({
    result: {
      TraceSummaries: [
        {
          Id: 'trace-5d1b0858-id',
          ResponseTime: 1,
          Http: {
            HttpURL: 'http://url'
          }
        }
      ],
      NextToken: null
    }
  }))
}))

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../../utils/std', () => ({
  out: jest.fn()
}))

const { option, positional } = yargs

test('command', () => {
  expect(command).toEqual('summary <deployment>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('deployment', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(option).toHaveBeenCalledWith('start-time', {
    describe: expect.any(String),
    alias: 's',
    type: 'string'
  })
  expect(option).toHaveBeenCalledWith('end-time', {
    describe: expect.any(String),
    alias: 'e',
    type: 'string'
  })
  expect(positional).toHaveBeenCalledTimes(1)
  expect(option).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    get.mockClear()
    out.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('console output', async () => {
    columnify.mockReturnValue('result-output')
    dateFormat.mockReturnValue('formatted-date')

    await handler({ deployment: 'deployment-id' })
    expect(columnify).toHaveBeenCalledWith(
      [{ id: 'trace-5d1b0858-id', latency: 1, time: 'formatted-date', url: 'http://url' }],
      { minWidth: 20, columns: ['time', 'id', 'latency', 'url'] }
    )
    expect(dateFormat).toHaveBeenCalledWith(new Date(1562052696000), expect.any(String))
  })

  test('api call: startTime specified', async () => {
    await handler({
      deployment: 'deployment-id',
      'start-time': 'start-time',
      'end-time': 'end-time'
    })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/tracing/summary', {
      startTime: 'start-time',
      endTime: 'end-time',
      nextToken: null
    })
  })
})
