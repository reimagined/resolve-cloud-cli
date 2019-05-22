const yargs = require('yargs')
const { command, builder, describe: commandDescription, aliases } = require('../../../commands/env')

jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('environment')
  expect(aliases).toContain('env')
  expect(commandDescription).toEqual(expect.any(String))
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('env')
  expect(commandDir).toHaveBeenCalledTimes(1)
})
