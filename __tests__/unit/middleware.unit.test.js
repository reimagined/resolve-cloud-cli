const consola = require('consola')
const latestVersion = require('latest-version')
const middleware = require('../../middleware')
const { version: packageVersion, name: packageName } = require('../../package')

beforeAll(() => {
  latestVersion.mockReturnValue(packageVersion)
})

let defaultOptions

beforeEach(() => {
  consola.level = 123
  defaultOptions = {
    verbose: false,
    verbosity: ''
  }
})

afterEach(() => {
  latestVersion.mockClear()
  consola.warn.mockClear()
})

test('default log level', async () => {
  await middleware(defaultOptions)

  expect(consola.level).toEqual(3)
})

test('verbosity=silent log level', async () => {
  await middleware({
    ...defaultOptions,
    verbosity: 'silent'
  })

  expect(consola.level).toEqual(-1)
})

test('verbosity=normal log level', async () => {
  await middleware({
    ...defaultOptions,
    verbosity: 'normal'
  })

  expect(consola.level).toEqual(3)
})

test('verbosity=debug log level', async () => {
  await middleware({
    ...defaultOptions,
    verbosity: 'debug'
  })

  expect(consola.level).toEqual(4)
})

test('verbosity=trace log level', async () => {
  await middleware({
    ...defaultOptions,
    verbosity: 'trace'
  })

  expect(consola.level).toEqual(5)
})

test('verbose option equals verbosity=debug', async () => {
  await middleware({
    ...defaultOptions,
    verbose: true
  })

  expect(consola.level).toEqual(4)
})

test('prefer verbosity level option', async () => {
  await middleware({
    ...defaultOptions,
    verbose: true,
    verbosity: 'silent'
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
  latestVersion.mockReturnValueOnce('999.999.999')

  await middleware(defaultOptions)

  expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('999.999.999'))
})

test('do not inform a user about older package versions', async () => {
  latestVersion.mockReturnValueOnce('0.0.0')

  await middleware(defaultOptions)

  expect(consola.warn).not.toHaveBeenCalledWith(expect.stringContaining('0.0.0'))
})
