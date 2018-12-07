const axios = require('axios')

jest.doMock('../../../constants', () => ({
  SERVICE_URL: 'http://fake.com',
  JOB_STATUS_REQUEST_INTERVAL_MS: 1
}))

const getCloudConfig = jest.fn().mockReturnValue({ token: 'auth-token' })

jest.doMock('../../../utils/config', () => ({
  getCloudConfig
}))

const {
  requestDeploy,
  waitJob,
  deploymentLogs,
  removeApp,
  addSecret,
  deleteSecret,
  deployments
} = require('../../../utils/api')

const remoteUrl = method => `http://fake.com/${method}`

const makeGetHeaders = (headers = {}) => ({
  Authorization: `Bearer auth-token`,
  ...headers
})

const makePostHeaders = (headers = {}) => ({
  maxContentLength: 209715200,
  headers: {
    Authorization: `Bearer auth-token`,
    'Content-Type': `application/json`,
    ...headers
  }
})

beforeEach(() => {
  axios.get.mockClear()
  axios.post.mockClear()
  getCloudConfig.mockClear()
})

describe('request-deploy', () => {
  const payload = {
    app: {
      name: 'test-name',
      version: 'test-version',
      eventstore: 'test-eventstore'
    }
  }

  beforeEach(() => {
    axios.post.mockReturnValue({ deploymentId: 'available-deployment-pool-id' })
  })

  test('valid POST request', async () => {
    await requestDeploy(payload)
    expect(axios.post).toHaveBeenCalledWith(
      remoteUrl('request-deploy'),
      payload,
      makePostHeaders({
        'Content-Type': 'application/json'
      })
    )
  })
})

describe('removeApp', () => {
  let payload = null

  beforeEach(() => {
    payload = {
      name: 'name',
      stage: 'stage',
      region: 'region'
    }
    axios.post.mockReturnValue({ data: {} })
  })

  test('valid POST request', async () => {
    await removeApp(payload)
    expect(axios.post).toHaveBeenCalledWith(remoteUrl('reset'), payload, makePostHeaders())
  })
})

describe('waitJob', () => {
  let params = null

  beforeEach(() => {
    params = {
      jobId: 'jobId',
      deploymentId: 'deploymentId'
    }
  })

  test('valid GET request', async () => {
    axios.get.mockReturnValue({ data: { status: 'completed' } })
    await waitJob(params)
    expect(axios.get).toHaveBeenCalledWith(remoteUrl('status'), {
      params,
      headers: makeGetHeaders()
    })
  })

  test('app url returned if present', async () => {
    axios.get.mockReturnValue({ data: { status: 'completed', url: 'http://my-great-app.com' } })
    const result = await waitJob(params)
    expect(result).toEqual('http://my-great-app.com')
  })

  test('fail if now status field present', async () => {
    axios.get.mockReturnValue({ data: {} })
    await expect(waitJob(params)).rejects.toBeInstanceOf(Error)
  })

  test('fail, if job status responded as [failed]', async () => {
    axios.get.mockReturnValue({ data: { status: 'failed' } })
    await expect(waitJob(params)).rejects.toBeInstanceOf(Error)
  })

  test('fail, if job status responded as [struck]', async () => {
    axios.get.mockReturnValue({ data: { status: 'stuck' } })
    await expect(waitJob(params)).rejects.toBeInstanceOf(Error)
  })

  test('success after one retry, ', async () => {
    axios.get
      .mockReturnValueOnce({ data: { status: 'active' } })
      .mockReturnValue({ data: { status: 'completed', url: 'http://my-great-app.com' } })
    await expect(waitJob(params)).resolves.toEqual('http://my-great-app.com')
  })
})

describe('deploymentLogs', () => {
  const params = {
    name: 'name',
    stage: 'stage',
    region: 'region'
  }

  axios.get.mockReturnValue({ data: {} })

  test('valid GET request', async () => {
    await deploymentLogs(params)
    expect(axios.get).toHaveBeenCalledWith(remoteUrl('logs'), {
      params,
      headers: makeGetHeaders()
    })
  })
})

describe('add-secret', () => {
  test('payload should be valid', async () => {
    axios.post.mockReturnValue({})

    const payload = {
      name: 'test-app-name',
      secret: {
        name: 'secret-name',
        value: 'secret-value'
      }
    }
    await addSecret(payload)
    expect(axios.post).toHaveBeenCalledWith(
      remoteUrl('add-secret'),
      payload,
      makePostHeaders({
        'Content-Type': 'application/json'
      })
    )
  })
})

describe('remove-secret', () => {
  test('payload should be valid', async () => {
    axios.post.mockReturnValue({})

    const payload = {
      name: 'test-app-name',
      secret: {
        name: 'secret-name'
      }
    }
    await deleteSecret(payload)
    expect(axios.post).toHaveBeenCalledWith(
      remoteUrl('delete-secret'),
      payload,
      makePostHeaders({
        'Content-Type': 'application/json'
      })
    )
  })
})

describe('deployments', () => {
  test('payload should be valid', async () => {
    await deployments()
    expect(axios.get).toHaveBeenCalledWith(remoteUrl('deployments'), {
      params: {},
      headers: makeGetHeaders()
    })
  })
})
