import yargs from 'yargs'

import { command, builder, describe as commandDescription, aliases } from '../../../commands/env'

jest.mock('../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('environment')
  expect(aliases).toContain('env')
  expect(commandDescription).toEqual(expect.any(String))
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('env', {
    exclude: /\.d\.ts/,
    extensions: ['ts', 'js'],
  })
  expect(commandDir).toHaveBeenCalledTimes(1)
})
