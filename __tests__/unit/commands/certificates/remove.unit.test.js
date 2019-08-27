const yargs = require('yargs')
const {
  command,
  handler,
  builder,
  aliases,
  describe: commandDescription
} = require('../../../../commands/certificates/remove')
const { del } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  del: jest.fn()
}))

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { positional } = yargs

test('command', () => {
  expect(command).toEqual('rm <id>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['remove', 'delete'])
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('id', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(positional).toHaveBeenCalledTimes(1)
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    del.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({ id: 'certificate-id' })

    expect(del).toHaveBeenCalledWith('token', 'certificates/certificate-id')
  })
})
