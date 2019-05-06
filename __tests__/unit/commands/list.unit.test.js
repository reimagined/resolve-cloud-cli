const columnify = require('columnify')
const { out } = require('../../../utils/std')
const {
  command,
  aliases,
  handler,
  describe: commandDescription
} = require('../../../commands/list')
const { get } = require('../../../api/client')
const refreshToken = require('../../../refreshToken')

jest.mock('../../../api/client', () => ({
  get: jest.fn()
}))
jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../utils/std', () => ({
  out: jest.fn()
}))

beforeAll(() => {
  get.mockResolvedValue({
    result: [
      {
        data: 'data'
      }
    ]
  })
})

test('command', () => {
  expect(command).toEqual('list')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['ls'])
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    get.mockClear()
    out.mockClear()
    columnify.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    columnify.mockReturnValue('result-output')

    await handler({})

    expect(columnify).toHaveBeenCalledWith([{ data: 'data' }], { minWidth: 30 })
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id',
      saga: 'saga-name'
    })

    expect(get).toHaveBeenCalledWith('token', 'deployments')
  })
})
