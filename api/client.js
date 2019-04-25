const axios = require('axios')
const config = require('../config')

const apiVersion = 'v0'

const request = async (
  token,
  method,
  url,
  data,
  params,
  headers
) => {
  const baseURL = `${config.get('api_url')}/${apiVersion}/`

  try {
    return (await axios.request({
      method,
      baseURL,
      url,
      params,
      data,
      maxContentLength: 200 * 1024 * 1024,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers
      }
    })).data
  } catch ({ response: { data: { statusCode, error } } }) {
    throw new Error(`Server responded with ${statusCode}: ${error}`)
  }
}

const post = async (token, path, payload, headers = { 'Content-Type': `application/json` }) =>
  request(token, 'POST', path, payload, {}, headers)

const get = async (token, path, params = {}, headers = {}) =>
  request(token, 'GET', path, null, params, headers)

const del = async (token, path, payload = {}, headers = { 'Content-Type': `application/json` }) =>
  request(token, 'DELETE', path, payload, {}, headers)

const put = async (token, path, payload = {}, headers = { 'Content-Type': `application/json` }) =>
  request(token, 'PUT', path, payload, {}, headers)

module.exports = {
  post,
  get,
  del
}
