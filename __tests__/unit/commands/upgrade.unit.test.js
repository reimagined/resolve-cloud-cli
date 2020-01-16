const { command, describe: commandDescription } = require('../../../commands/upgrade')

jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

test('command', () => {
  expect(command).toEqual('upgrade <deployment>')
  expect(commandDescription).toEqual(expect.any(String))
})
