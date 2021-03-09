import yargs from 'yargs'

import {
  command,
  aliases,
  builder,
  describe as commandDescription,
} from '../../../../commands/sagas/properties'

jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('properties')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['props'])
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('properties', {
    exclude: /\.d\.ts/,
    extensions: ['ts', 'js'],
  })
  expect(commandDir).toHaveBeenCalledTimes(1)
})
