const yargs = require('yargs')
const { command, builder, describe: commandDescription } = require('../../../commands/certificates')

jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('certificates')
  expect(commandDescription).toEqual(expect.any(String))
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('certificates')
  expect(commandDir).toHaveBeenCalledTimes(1)
})
