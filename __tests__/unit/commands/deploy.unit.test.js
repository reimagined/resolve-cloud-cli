/* eslint-disable no-underscore-dangle */
jest.mock('fs')

const fs = require('fs')
const log = require('consola')
const path = require('path')
const { DEFAULT_CONFIG } = require('../../../constants')

jest.doMock('../../../utils/spinner', () => () => ({
  spin: jest.fn(),
  stop: jest.fn()
}))

const waitJobData = {
  jobId: 'job-id',
  deploymentId: 'deployment-id'
}

const commitDeploy = jest.fn().mockReturnValue({ jobId: 'job-id' })
const requestDeploy = jest.fn().mockReturnValue({ deploymentId: 'deployment-id' })
const upload = jest.fn().mockReturnValue({ id: 'file-Id' })
const waitJob = jest.fn().mockReturnValue('http://my-great-app.com')

jest.doMock('../../../utils/api', () => ({
  waitJob,
  upload,
  commitDeploy,
  requestDeploy
}))

const validateSubdomainName = jest.fn().mockReturnValue('')

jest.doMock('../../../utils/verification', () => ({
  validateSubdomainName
}))

const packager = jest.fn()

jest.doMock('../../../packager', () => packager)

const handler = require('../../../commands/deploy')

beforeEach(() => {
  const files = {}
  files[`${path.resolve('code.zip')}`] = 'zip-stream'
  files[`${path.resolve('static.zip')}`] = 'zip-stream'

  fs.__setMockFiles(files)

  validateSubdomainName.mockClear()
  packager.mockClear()
})

test('empty arguments', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, {})
  expect(requestDeploy).toHaveBeenCalledWith({
    app: {
      name: 'name-from-package-json',
      version: '1.0',
      eventstore: undefined
    }
  })
  expect(upload).toHaveBeenCalledTimes(2)
  expect(commitDeploy).toHaveBeenCalledWith({
    app: {
      name: 'name-from-package-json',
      version: '1.0'
    },
    deploymentId: 'deployment-id',
    codeLocation: 'file-Id',
    staticLocation: 'file-Id',
    eventstore: undefined
  })
})

test('ignore arguments', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, { config: 'should-pass' })
  expect(packager).toHaveBeenCalledWith('should-pass', 'deployment-id')
})

test('package name validated', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, {})
  expect(validateSubdomainName).toHaveBeenCalledWith('name-from-package-json')
})

test('packager have been called by default', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, {})
  expect(packager).toHaveBeenCalled()
})

test('packager have not been called with --skipBuild', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, { skipBuild: true })
  expect(packager).not.toHaveBeenCalled()
})

test('packager default config', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, {})
  expect(packager).toHaveBeenCalledWith(DEFAULT_CONFIG, 'deployment-id')
})

test('deploying started with defaults', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, {})
  expect(requestDeploy).toHaveBeenCalledWith({
    app: {
      name: 'name-from-package-json',
      version: '1.0',
      eventstore: undefined
    }
  })
})

test('deploying with specified --eventstore', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, { eventstore: 'specified-es' })
  expect(requestDeploy).toHaveBeenCalledWith({
    app: {
      name: 'name-from-package-json',
      version: '1.0',
      eventstore: 'specified-es'
    }
  })
})

test('waiting for the deploy job to complete', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, {})
  expect(waitJob).toHaveBeenCalledWith(waitJobData)
})

test('the deployed app URL is displayed to the user', async () => {
  await handler({ name: 'name-from-package-json', version: '1.0' }, {})
  expect(log.success.mock.calls[log.success.mock.calls.length - 1][0]).toContain(
    'http://my-great-app.com'
  )
})
