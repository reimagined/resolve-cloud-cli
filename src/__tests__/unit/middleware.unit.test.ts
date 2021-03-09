test('', () => {})

/*
import consola from 'consola'
import latestVersion from 'latest-version'
import { mocked } from 'ts-jest/utils'

import middleware from '../../middleware'

const { version: packageVersion, name: packageName } = require('../../../package.json')

beforeAll(() => {
  mocked(latestVersion).mockReturnValue(Promise.resolve(packageVersion))
})

let defaultOptions: any

beforeEach(() => {
  consola.level = 123
  defaultOptions = {
    verbose: false,
    verbosity: '',
  }
})

afterEach(() => {
  mocked(latestVersion).mockClear()
  mocked(consola.warn).mockClear()
})

test('default log level', async () => {
  await middleware(defaultOptions)

  expect(consola.level).toEqual(3)
})

test('verbosity=silent log level', async () => {
  await middleware({
    ...defaultOptions,
    verbosity: 'silent',
  })

  expect(consola.level).toEqual(-1)
})

test('verbosity=normal log level', async () => {
  await middleware({
    ...defaultOptions,
    verbosity: 'normal',
  })

  expect(consola.level).toEqual(3)
})

test('verbosity=debug log level', async () => {
  await middleware({
    ...defaultOptions,
    verbosity: 'debug',
  })

  expect(consola.level).toEqual(4)
})

test('verbosity=trace log level', async () => {
  await middleware({
    ...defaultOptions,
    verbosity: 'trace',
  })

  expect(consola.level).toEqual(5)
})

test('verbose option equals verbosity=debug', async () => {
  await middleware({
    ...defaultOptions,
    verbose: true,
  })

  expect(consola.level).toEqual(4)
})

test('prefer verbosity level option', async () => {
  await middleware({
    ...defaultOptions,
    verbose: true,
    verbosity: 'silent',
  })

  expect(consola.level).toEqual(-1)
})

test('latest version of the package requested', async () => {
  await middleware(defaultOptions)

  expect(latestVersion).toHaveBeenCalledWith(packageName)
})

test('do not inform a user about same package version', async () => {
  await middleware(defaultOptions)

  expect(consola.warn).not.toHaveBeenCalledWith(expect.stringContaining(packageVersion))
})

test('inform a user about new package version', async () => {
  mocked(latestVersion).mockReturnValueOnce(Promise.resolve('999.999.999'))

  await middleware(defaultOptions)

  expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('999.999.999'))
})

test('do not inform a user about older package versions', async () => {
  mocked(latestVersion).mockReturnValueOnce(Promise.resolve('0.0.0'))

  await middleware(defaultOptions)

  expect(consola.warn).not.toHaveBeenCalledWith(expect.stringContaining('0.0.0'))
})
*/
