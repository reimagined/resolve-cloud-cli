const nanoid = require('nanoid')
const { DEFAULT_REGION, DEFAULT_STAGE } = require('../../../constants')

jest.doMock('../../../utils/spinner', () => () => ({
  spin: jest.fn(),
  stop: jest.fn()
}))

const removeJobData = {
  jobId: nanoid(),
  deploymentId: nanoid()
}

const removeApp = jest.fn().mockReturnValue(removeJobData)
const waitJob = jest.fn()

jest.doMock('../../../utils/api', () => ({
  removeApp,
  waitJob
}))

const handler = require('../../../commands/remove')

beforeEach(() => {
  removeApp.mockClear()
  waitJob.mockClear()
})

const app = { name: 'name-from-package-json', version: '0.0.1' }

test('removing an app with default options', async () => {
  await handler(app, null, {})
  expect(removeApp).toHaveBeenCalledWith({
    name: 'name-from-package-json',
    stage: DEFAULT_STAGE,
    region: DEFAULT_REGION
  })
})

test('removing another user app with default options', async () => {
  await handler(app, 'app-2', {})
  expect(removeApp).toHaveBeenCalledWith({
    name: 'app-2',
    stage: DEFAULT_STAGE,
    region: DEFAULT_REGION
  })
})

test('removing an app at specified --stage', async () => {
  await handler(app, null, { stage: 'specified-stage' })
  expect(removeApp).toHaveBeenCalledWith({
    name: 'name-from-package-json',
    stage: 'specified-stage',
    region: DEFAULT_REGION
  })
})

test('ignore arguments', async () => {
  await handler(app, null, { stage: 'specified-stage' })
  expect(removeApp).toHaveBeenCalledWith({
    name: 'name-from-package-json',
    stage: 'specified-stage',
    region: DEFAULT_REGION
  })
})

test('waiting for the job to complete', async () => {
  await handler(app, null, {})
  expect(waitJob).toHaveBeenCalledWith(removeJobData)
})
