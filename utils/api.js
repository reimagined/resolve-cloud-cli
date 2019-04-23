const axios = require('axios')
const { getCloudConfig } = require('./config')
const { SERVICE_URL, JOB_STATUS_REQUEST_INTERVAL_MS } = require('../constants')

const post = async (method, payload, headers = { 'Content-Type': `application/json` }) => {
  const { token } = await getCloudConfig()
  return (await axios.post(`${SERVICE_URL}/${method}`, payload, {
    maxContentLength: 200 * 1024 * 1024, // 200 Mb,
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers
    }
  })).data
}

const get = async (method, params = {}, headers = {}) => {
  const { token } = await getCloudConfig()
  return (await axios.get(`${SERVICE_URL}/${method}`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers
    }
  })).data
}

/**
 * @param {String} params.jobId
 * @param {String} params.deploymentId
 * @returns {Promise<String>}
 */
const waitJob = async params => {
  const { status, url } = await get('status', params)

  if (!status) {
    throw new Error(`inconsistent service response`)
  }

  if (status === 'completed') {
    return url
  }

  if (status === 'failed' || status === 'stuck') {
    throw new Error(`Job failed with status: ${status}`)
  }

  await new Promise(resolve => setTimeout(resolve, JOB_STATUS_REQUEST_INTERVAL_MS))
  return waitJob(params)
}

const requestDeploy = async payload =>
  post('request-deploy', payload, {
    'Content-Type': 'application/json'
  })

/**
 * @param {FormData} payload
 * @returns {Promise<{ jobId, deploymentId }>}
 */
const upload = async payload =>
  post('upload', payload, {
    'Content-Type': `multipart/form-data; boundary=${payload.getBoundary()}`
  })

/**
 * @param {FormData} payload
 * @returns {Promise<>}
 */
const commitDeploy = async payload =>
  post('commit-deploy', payload, {
    'Content-Type': `application/json`
  })

/**
 * @param {String} payload.name
 * @param {String} payload.stage
 * @param {String} payload.region
 * @returns {Promise<{ jobId, deploymentId }>}
 */
const removeApp = async payload => post('reset', payload)

/**
 * @param {String} payload.name
 * @param {String} payload.stage
 * @param {String} payload.region
 * @returns {Promise<String>}
 */
const deploymentLogs = async payload => get('logs', payload)

/**
 * @param {String} payload.app.name
 * @param {String} payload.secret.name
 * @param {String} payload.secret.value
 * @returns {Promise<String>}
 */
const addSecret = async payload => post('add-secret', payload)
const deleteSecret = async payload => post('delete-secret', payload)
const deployments = async () => get('deployments')

/**
 * @param {String} payload.app.name
 * @param {String} payload.command
 * @returns {Promise<String>}
 */
const readModel = async payload => post('readmodel', payload)

/**
 * @param {String} payload.app.name
 * @param {String} payload.command
 * @returns {Promise<String>}
 */
const saga = async payload => post('saga', payload)

module.exports = {
  waitJob,
  requestDeploy,
  upload,
  commitDeploy,
  removeApp,
  deploymentLogs,
  addSecret,
  deleteSecret,
  deployments,
  readModel,
  saga
}
