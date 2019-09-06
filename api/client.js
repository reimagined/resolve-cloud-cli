const log = require('consola')
const axios = require('axios')
const isEmpty = require('lodash.isempty')
const config = require('../config')

const apiVersion = 'v0'

const request = async (token, method, url, data, params, headers) => {
  const baseURL = `${config.get('api_url')}/${apiVersion}/`

  try {
    log.trace(`> ${method}: ${baseURL}${url}`)
    if (!isEmpty(data)) {
      log.trace(data)
    }
    const { data: response, status } = await axios.request({
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
    })
    log.trace(`< [${status}] ${method}: ${baseURL}${url}`)
    if (!isEmpty(response.result)) {
      log.trace(response.result)
    }
    return response
  } catch (e) {
    if (e.response) {
      const {
        response: { status, data: message }
      } = e
      throw new Error(`${status}: ${message}`)
    }
    throw e
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
  del,
  put
}
