const yargs = require('yargs')
const { command, builder, describe: commandDescription } = require('../../../commands/sagas')

jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('sagas')
  expect(commandDescription).toEqual(expect.any(String))
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('sagas')
  expect(commandDir).toHaveBeenCalledTimes(1)
})
