/* eslint-disable no-underscore-dangle */
const nanoid = require('nanoid')
const commander = require('commander')

const version = nanoid()

jest.doMock('../../package', () => ({
  version
}))

require('../../index')

const findCall = (fn, ...args) => {
  const match = JSON.stringify(args)
  return fn.mock.calls.some(call => JSON.stringify(call) === match)
}

describe('globals', () => {
  test('module version registered', () => {
    expect(commander.version.mock.calls[0][0]).toEqual(version)
  })

  test('process args are parsed', () => {
    expect(commander.parse).toHaveBeenCalled()
  })
})

describe('deploy', () => {
  test('valid name', () => {
    expect(findCall(commander.command, 'deploy')).toBeTruthy()
  })
})

describe('remove', () => {
  test('valid name', () => {
    expect(findCall(commander.command, 'remove [applicationName]')).toBeTruthy()
  })
})

describe('logs', () => {
  test('valid name', () => {
    expect(findCall(commander.command, 'logs [applicationName]')).toBeTruthy()
  })
})

describe('login', () => {
  test('valid name', () => {
    expect(findCall(commander.command, 'login')).toBeTruthy()
  })
})
