import { createCloudSdk, isNetworkError, CloudSdk, SetupOptions } from 'resolve-cloud-sdk'
import { URL } from 'url'
import { promises } from 'dns'
import nodeFetch from 'node-fetch'

import { logger } from '../utils/std'
import { refreshToken, isAuthError, logout, isLoggedIn } from './auth'
import * as config from '../config'

type Fetch = typeof fetch

export type ExtendedCloudSdk = CloudSdk & { refreshToken: () => Promise<void> }

let client: ExtendedCloudSdk
const createCloudSdkClient = async (): Promise<ExtendedCloudSdk> => {
  if (client != null) {
    return client
  }

  const sdk = createCloudSdk()
  let setupOptions: SetupOptions = {
    logger,
    fetch: nodeFetch as any as Fetch,
  }

  client = {
    ...Object.entries(sdk).reduce((acc, [methodName, callback]) => {
      acc[methodName] = async (...args: Array<any>) => {
        try {
          return await (callback as any)(...args)
        } catch (error) {
          if (isAuthError({ errorText: `${error}` })) {
            await logout()
          }
          throw error
        }
      }
      return acc
    }, {} as any),
    async refreshToken() {
      if (isLoggedIn()) {
        setupOptions.token = await refreshToken()
        sdk.setup(setupOptions)
      }
    },
  }

  const { host } = new URL(config.get('api_url'))

  for (;;) {
    try {
      const ips = await promises.resolve4(host)
      const ip = ips[Math.floor(Math.random() * ips.length)]

      logger.trace(`DNS resolved: ${host} -> ${ip}`)

      const baseUrl = `https://${ip}:443`

      setupOptions = {
        ...setupOptions,
        baseUrl,
        baseHeaders: {
          Host: host,
        },
      }

      sdk.setup(setupOptions)

      await client.heartbeat()

      break
    } catch (error) {
      if (!isNetworkError({ errorText: `${error}` })) {
        throw error
      }
    }
  }

  if (config.get('auth.client_id') == null || config.get('auth.user_pool_id') == null) {
    const { clientId, userPoolId } = await client.getClientAppConfig({})

    config.set('auth.client_id', clientId)
    config.set('auth.user_pool_id', userPoolId)
  }

  await client.refreshToken()

  return client
}

export default createCloudSdkClient
