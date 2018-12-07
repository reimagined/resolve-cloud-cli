/* eslint-disable no-underscore-dangle */
jest.mock('fs')

const fs = require('fs')
const { CLOUD_CONFIG: { PATH: configPath } } = require('../../../constants')
const { getCloudConfig, updateCloudConfig } = require('../../../utils/config')

describe('getCloudConfig', () => {
  beforeEach(() => {
    const mockFiles = {}
    mockFiles[configPath] = JSON.stringify({ valid: true })

    fs.__setMockFiles(mockFiles)
  })

  test('returns valid object', async () => {
    const config = await getCloudConfig()
    expect(config).toEqual({ valid: true })
  })

  test('empty config if file not exist', async () => {
    fs.__clear()
    const config = await getCloudConfig()
    expect(config).toEqual({})
  })
})

describe('getCloudConfig [process.env]', () => {
  beforeEach(() => {
    process.env.RESOLVE_USERNAME = 'test-username'
    process.env.RESOLVE_REFRESH_TOKEN = 'test-token'
  })
  afterEach(() => {
    delete process.env.RESOLVE_USERNAME
    delete process.env.RESOLVE_REFRESH_TOKEN
  })

  test('get config from process.env', async () => {
    const config = await getCloudConfig()

    expect(config).toEqual({
      userName: 'test-username',
      refreshToken: 'test-token'
    })
  })
})

describe('updateCloudConfig', () => {
  beforeEach(() => {
    fs.__clear()
  })

  test('config file updated', async () => {
    await updateCloudConfig({ valid: true })
    expect(JSON.parse(fs.__getMockFiles()[configPath])).toEqual({ valid: true })
  })
})
