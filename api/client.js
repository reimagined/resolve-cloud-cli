const axios = require('axios')
const { getCloudConfig } = require('./config')

const apiUrl = process.env.RESOLVE_CLOUD_HOST || 'https://api.resolve.sh'

const post = async (method, payload, headers = { 'Content-Type': `application/json` }) => {
  const { token } = await getCloudConfig()
  return (await axios.post(`${apiUrl}/${method}`, payload, {
    maxContentLength: 200 * 1024 * 1024, // 200 Mb,
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers
    }
  })).data
}

const get = async (method, params = {}, headers = {}) => {
  const { token } = await getCloudConfig()
  return (await axios.get(`${apiUrl}/${method}`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers
    }
  })).data
}

exports = {
  post,
  get
}
