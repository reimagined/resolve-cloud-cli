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
  readFile: jest.fn(name => `contents-of-${name}`)
}))

const { option } = yargs

test('command', () => {
  expect(command).toEqual('issue')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(option).toHaveBeenCalledWith('certificate-file', {
    alias: 'crt',
    describe: expect.any(String),
    type: 'string',
    demand: expect.any(String)
  })
  expect(option).toHaveBeenCalledWith('key-file', {
    alias: 'key',
    describe: expect.any(String),
    type: 'string',
    demand: expect.any(String)
  })
  expect(option).toHaveBeenCalledWith('chain-file', {
    alias: 'ca',
    describe: expect.any(String),
    type: 'string'
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
      'certificate-file': 'certificate-file',
      'key-file': 'key-file',
      'chain-file': 'chain-file',
      id: 'id'
    })

    expect(post).toHaveBeenCalledWith('token', 'certificates', {
      certificate: 'contents-of-certificate-file',
      key: 'contents-of-key-file',
      chain: 'contents-of-chain-file',
      id: 'id'
    })
    expect(readFile).toHaveBeenCalledWith('certificate-file', 'utf8')
    expect(readFile).toHaveBeenCalledWith('key-file', 'utf8')
    expect(readFile).toHaveBeenCalledWith('chain-file', 'utf8')
    expect(readFile).toHaveBeenCalledTimes(3)
  })

  test('bug: readFile exception if no chain option provided', async () => {
    await handler({
      'certificate-file': 'certificate-file',
      'key-file': 'key-file',
      id: 'id'
    })

    expect(post).toHaveBeenCalledWith('token', 'certificates', {
      certificate: 'contents-of-certificate-file',
      key: 'contents-of-key-file',
      chain: undefined,
      id: 'id'
    })
    expect(readFile).toHaveBeenCalledTimes(2)
  })
})
