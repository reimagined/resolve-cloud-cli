const yargs = require('yargs')
const { command, builder, describe: commandDescription } = require('../../../commands/tracing')

jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('tracing')
  expect(commandDescription).toEqual(expect.any(String))
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('tracing')
  expect(commandDir).toHaveBeenCalledTimes(1)
})
