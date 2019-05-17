const yargs = require('yargs')
const {
  command,
  aliases,
  builder,
  describe: commandDescription
} = require('../../../../commands/sagas/properties')

jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('properties')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['props'])
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('properties')
  expect(commandDir).toHaveBeenCalledTimes(1)
})
