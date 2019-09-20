const consola = require('consola')
const latestVersion = require('latest-version')
const middleware = require('../../middleware')
const { version: packageVersion, name: packageName } = require('../../package')

beforeAll(() => {
  latestVersion.mockReturnValue(packageVersion)
})

beforeEach(() => {
  consola.level = 123
})

afterEach(() => {
  latestVersion.mockClear()
  consola.warn.mockClear()
})

test('default log level', async () => {
  await middleware({ verbose: false })

  expect(consola.level).toEqual(1)
})

test('verbose log level', async () => {
  await middleware({ verbose: true })

  expect(consola.level).toEqual(5)
})

test('latest version of the package requested', async () => {
  await middleware({ verbose: false })

  expect(latestVersion).toHaveBeenCalledWith(packageName)
})

test('do not inform a user about same package version', async () => {
  await middleware({ verbose: false })

  expect(consola.warn).not.toHaveBeenCalledWith(expect.stringContaining(packageVersion))
})

test('inform a user about new package version', async () => {
  latestVersion.mockReturnValueOnce('999.999.999')

  await middleware({ verbose: false })

  expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('999.999.999'))
})

test('do not inform a user about older package versions', async () => {
  latestVersion.mockReturnValueOnce('0.0.0')

  await middleware({ verbose: false })

  expect(consola.warn).not.toHaveBeenCalledWith(expect.stringContaining('0.0.0'))
})
