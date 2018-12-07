let deploymentLogs = jest.fn().mockReturnValue('some logs')

jest.doMock('../../../utils/api', () => ({
  deploymentLogs: (...args) => deploymentLogs(...args)
}))

const handler = require('../../../commands/logs')
const log = require('consola')

const app = { name: 'name-from-package-json', version: '0.0.1' }

beforeEach(() => {
  deploymentLogs.mockClear()
  log.info.mockClear()
  log.error.mockClear()
})

test('default invoke', async () => {
  await handler(app, {})
  expect(deploymentLogs).toBeCalledWith({ applicationName: 'name-from-package-json' })
  expect(log.info).toBeCalledWith('some logs')
})

test('startTime option', async () => {
  await handler(app, { startTime: 'startTime' })
  expect(deploymentLogs).toBeCalledWith({
    applicationName: 'name-from-package-json',
    startTime: 'startTime'
  })
  expect(log.info).toBeCalledWith('some logs')
})

test('endTime option', async () => {
  await handler(app, { endTime: 'endTime' })
  expect(deploymentLogs).toBeCalledWith({
    applicationName: 'name-from-package-json',
    endTime: 'endTime'
  })
  expect(log.info).toBeCalledWith('some logs')
})

test('filterPattern option', async () => {
  await handler(app, { filterPattern: 'filterPattern' })
  expect(deploymentLogs).toBeCalledWith({
    applicationName: 'name-from-package-json',
    filterPattern: 'filterPattern'
  })
  expect(log.info).toBeCalledWith('some logs')
})

test('streamLimit option', async () => {
  await handler(app, { streamLimit: 'streamLimit' })
  expect(deploymentLogs).toBeCalledWith({
    applicationName: 'name-from-package-json',
    streamLimit: 'streamLimit'
  })
  expect(log.info).toBeCalledWith('some logs')
})

test('all options', async () => {
  await handler(app, {
    streamLimit: 'streamLimit',
    endTime: 'endTime',
    startTime: 'startTime',
    filterPattern: 'filterPattern'
  })
  expect(deploymentLogs).toBeCalledWith({
    applicationName: 'name-from-package-json',
    streamLimit: 'streamLimit',
    endTime: 'endTime',
    startTime: 'startTime',
    filterPattern: 'filterPattern'
  })
  expect(log.info).toBeCalledWith('some logs')
})

test('request failure', async () => {
  deploymentLogs = () => Promise.reject(Error('oops'))

  await handler(app, { startTime: 'startTime' })
  expect(log.error).toBeCalledWith('oops')
  expect(log.info).not.toBeCalled()
})
