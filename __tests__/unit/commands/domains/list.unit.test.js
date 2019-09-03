const dateFormat = require('dateformat')
const columnify = require('columnify')
const { out } = require('../../../../utils/std')
const {
  command,
  aliases,
  handler,
  describe: commandDescription
} = require('../../../../commands/domains/list')
const { get } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  get: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../../utils/std', () => ({
  out: jest.fn()
}))

const dateAdded = '2019-01-01T01:01:01.000Z'

beforeAll(() => {
  get.mockResolvedValue({
    result: [
      {
        domain: 'domain-name',
        assignedTo: 'assigned-to-deployment',
        addedAt: dateAdded,
        verified: true
      }
    ]
  })
})

test('command', () => {
  expect(command).toEqual('list')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['ls', '$0'])
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    get.mockClear()
    dateFormat.mockClear()
    out.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    columnify.mockReturnValue('result-output')
    dateFormat.mockReturnValue('formatted-date')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      [
        {
          domain: 'domain-name',
          assignedTo: 'assigned-to-deployment',
          'added at': 'formatted-date',
          verified: true
        }
      ],
      expect.any(Object)
    )
    expect(dateFormat).toHaveBeenCalledWith(new Date(dateAdded), expect.any(String))
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('api call', async () => {
    await handler({})

    expect(get).toHaveBeenCalledWith('token', 'domains')
  })
})
