import axios from 'axios'
import { URL } from 'url'
import { promises } from 'dns'
import isEmpty from 'lodash.isempty'
import { createDecipheriv } from 'crypto'

import * as config from '../config'
import { logger } from '../utils/std'
import { HEADER_EXECUTION_MODE } from '../constants'
import { undefined } from 'io-ts'

const request = async (token: any, method: any, url: any, data: any, params: any, headers: any) => {
  const apiUrl = config.get('api_url')
  const baseURL = apiUrl.replace(/\/$/, '')

  for (;;) {
    const { host, protocol } = new URL(apiUrl)

    const apiIP = `${protocol}//${(await promises.resolve4(host))[0]}:443`

    // eslint-disable-next-line no-param-reassign
    url = url.startsWith('/') ? url : `/${url}`

    if (!isEmpty(data)) {
      logger.trace(data)
    }

    const requestHeaders = {
      ...headers,
      Host: host,
    }

    if (!isEmpty(token)) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

    try {
      logger.debug(
        `> ${method}: ${baseURL}${url} { mode: ${
          headers[HEADER_EXECUTION_MODE] === 'async' ? '"async"' : '"sync"'
        } }`
      )

      const { data: response, status, headers: responseHeaders } = await axios.request({
        method,
        baseURL: apiIP,
        url,
        params,
        data,
        maxContentLength: 200 * 1024 * 1024,
        headers: requestHeaders,
        timeout: 60000,
      })

      if (`${response}`.includes(`<?xml version="1.0" encoding="UTF-8"?>`)) {
        throw new Error(response)
      }

      const { executionId, executionToken, executionSalt, result } = response

      if (result !== undefined && headers[HEADER_EXECUTION_MODE] !== 'async') {
        logger.debug(
          `< [${status}] ${method}: ${baseURL}${url} { mode: ${
            responseHeaders[HEADER_EXECUTION_MODE] === 'async' ? '"async"' : '"sync"'
          } }`
        )
        return { result }
      }

      const describeMethod = 'GET'
      const describeUrl = `/describe-execution/${executionId}`

      for (;;) {
        logger.trace(`>> ${describeMethod}: ${baseURL}${describeUrl}`)

        const { data: responseData, status: describeStatus } = await axios.request({
          method: describeMethod,
          baseURL: apiIP,
          url: describeUrl,
          params,
          data: null,
          maxContentLength: 200 * 1024 * 1024,
          headers: {
            ...requestHeaders,
            [HEADER_EXECUTION_MODE]: undefined,
          },
          timeout: 60000,
        })

        const executionStatus = responseData?.result?.Status
        const Output = responseData?.result?.Output

        logger.trace(`<< [${describeStatus}] ${describeMethod}: ${baseURL}${describeUrl}`)

        if (Output?.errorType != null && Output?.errorMessage != null && Output?.trace != null) {
          const error = new Error()
          error.name = Output.errorType
          error.message = Output.errorMessage
          error.stack = Output.trace.join('\n')
          throw error
        }

        switch (executionStatus) {
          case 'SUCCEEDED': {
            const decipher = createDecipheriv('aes-256-ctr', executionToken, executionSalt)

            const decrypted = Buffer.concat([
              decipher.update(Buffer.from(Output, 'base64')),
              decipher.final(),
            ])

            logger.debug(
              `< [${status}] ${method}: ${baseURL}${url} { mode: ${
                responseHeaders[HEADER_EXECUTION_MODE] === 'async' ? '"async"' : '"sync"'
              } }`
            )
            return JSON.parse(decrypted.toString())
          }
          case 'RUNNING': {
            logger.trace('Execution status "RUNNING". Retrying...')
            await new Promise((resolve) => setTimeout(resolve, 3000))
            break
          }
          default: {
            throw Error(`Command has been completed with status "${executionStatus}"`)
          }
        }
      }
    } catch (e) {
      const errorText = `${e} ${e?.response?.data}`
      const isRetryable =
        /timeout of (\d+)ms exceeded/.test(errorText) ||
        /ETIMEDOUT/.test(errorText) ||
        /ECONNRESET/.test(errorText) ||
        /The Lambda function associated with the CloudFront distribution was throttled/.test(
          errorText
        )
      if (e.response != null) {
        const {
          response: { status, data: responseData },
        } = e
        if (isRetryable) {
          logger.debug(`Task timed out. Retrying...`)
          continue
        }
        if (typeof responseData === 'object') {
          throw new Error(`${status}: ${responseData.message}`)
        }
        throw new Error(`${status}: ${responseData}`)
      }
      if (isRetryable) {
        logger.debug(`Task timed out. Retrying...`)
        continue
      }
      throw e
    }
  }
}

export const post = async (
  token: any,
  path: any,
  payload: any,
  headers: any = { 'Content-Type': `application/json` }
) => request(token, 'POST', path, payload, {}, headers)

export const get = async (token: any, path: any, params: any = {}, headers: any = {}) =>
  request(token, 'GET', path, null, params, headers)

export const del = async (
  token: any,
  path: any,
  payload: any = {},
  headers: any = { 'Content-Type': `application/json` }
) => request(token, 'DELETE', path, payload, {}, headers)

export const put = async (
  token: any,
  path: any,
  payload: any = {},
  headers: any = { 'Content-Type': `application/json` }
) => request(token, 'PUT', path, payload, {}, headers)

export const patch = async (
  token: any,
  path: any,
  payload: any = {},
  headers: any = { 'Content-Type': `application/json` }
) => request(token, 'PATCH', path, payload, {}, headers)
