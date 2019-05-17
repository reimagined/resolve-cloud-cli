const yargs = require('yargs')
const { command, builder, describe: commandDescription } = require('../../../commands/logs')

jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('logs')
  expect(commandDescription).toEqual(expect.any(String))
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('logs')
  expect(commandDir).toHaveBeenCalledTimes(1)
})
