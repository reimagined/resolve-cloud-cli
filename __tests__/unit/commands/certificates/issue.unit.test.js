const yargs = require('yargs')
const { readFile } = require('fs')
const {
  command,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/certificates/issue')
const { post } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

jest.mock('../../../../api/client', () => ({
  post: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('util', () => ({
  promisify: fn => fn
}))
jest.mock('fs', () => ({
  readFile: jest.fn(name => name)
}))

const { option } = yargs

test('command', () => {
  expect(command).toEqual('issue')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(option).toHaveBeenCalledWith('certificateFile', {
    alias: 'crt',
    describe: expect.any(String),
    type: 'string',
    demand: expect.any(String)
  })
  expect(option).toHaveBeenCalledWith('keyFile', {
    alias: 'key',
    describe: expect.any(String),
    type: 'string',
    demand: expect.any(String)
  })
  expect(option).toHaveBeenCalledWith('chainFile', {
    alias: 'ca',
    describe: expect.any(String),
    type: 'string',
    demand: expect.any(String)
  })
  expect(option).toHaveBeenCalledWith('id', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(option).toHaveBeenCalledTimes(4)
})

describe('handler', () => {
  afterEach(() => {
    refreshToken.mockClear()
    post.mockClear()
    readFile.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      certificateFile: 'certificate-file',
      keyFile: 'key-file',
      chainFile: 'chain-file',
      id: 'id'
    })

    expect(post).toHaveBeenCalledWith('token', 'certificates', {
      certificate: 'certificate-file',
      key: 'key-file',
      chain: 'chain-file',
      id: 'id'
    })
    expect(readFile).toHaveBeenCalledWith('certificate-file', 'utf8')
    expect(readFile).toHaveBeenCalledWith('key-file', 'utf8')
    expect(readFile).toHaveBeenCalledWith('chain-file', 'utf8')
    expect(readFile).toHaveBeenCalledTimes(3)
  })
})
