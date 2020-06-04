const columnify = require('columnify')
const { out } = require('../../../utils/std')
const { update: describeUpdate } = require('../../../utils/describe')
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
jest.mock('../../../utils/describe', () => ({
  update: jest.fn(() => ({ versionText: 'version-text', updateText: 'update-text' }))
}))

beforeAll(() => {
  get.mockResolvedValue({
    result: [
      {
        version: '0.1.0',
        latestVersion: '0.2.0'
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
    describeUpdate.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output: up-to-date', async () => {
    columnify.mockReturnValue('result-output')

    await handler({})

    expect(columnify).toHaveBeenCalledWith([{ version: 'version-text', update: 'update-text' }], {
      minWidth: 30,
      config: {
        version: { minWidth: 10 }
      }
    })
    expect(out).toHaveBeenCalledWith('result-output')
    expect(describeUpdate).toHaveBeenLastCalledWith({ version: '0.1.0', latestVersion: '0.2.0' })
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id',
      saga: 'saga-name'
    })

    expect(get).toHaveBeenCalledWith('token', 'deployments')
  })
})
