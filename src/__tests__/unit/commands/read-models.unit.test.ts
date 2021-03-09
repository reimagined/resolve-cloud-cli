import yargs from 'yargs'

import { command, builder, describe as commandDescription } from '../../../commands/read-models'

jest.mock('../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)

const { commandDir } = yargs

test('command', () => {
  expect(command).toEqual('read-models')
  expect(commandDescription).toEqual(expect.any(String))
})

test('builder', () => {
  builder(yargs)

  expect(commandDir).toHaveBeenCalledWith('read-models', {
    exclude: /\.d\.ts/,
    extensions: ['ts', 'js'],
  })
  expect(commandDir).toHaveBeenCalledTimes(1)
})
