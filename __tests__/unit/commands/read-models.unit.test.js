const yargs = require('yargs')
const { command, builder, describe: commandDescription } = require('../../../commands/read-models')

jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('read-models')
  expect(commandDescription).toEqual(expect.any(String))
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('read-models')
  expect(commandDir).toHaveBeenCalledTimes(1)
})
