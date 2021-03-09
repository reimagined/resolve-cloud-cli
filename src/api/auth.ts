import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'

import * as config from '../config'
import { get } from './client'
import { logger } from '../utils/std'

export const login = async (Username: string, Password: string) => {
  const {
    result: { ClientId, UserPoolId },
  } = await get(null, '/client-app-config')

  config.set('auth.client_id', ClientId)
  config.set('auth.user_pool_id', UserPoolId)

  const Pool = new CognitoUserPool({
    UserPoolId,
    ClientId,
  })

  const user = new CognitoUser({ Username, Pool })

  try {
    const refreshToken = await new Promise((resolve, reject) =>
      user.authenticateUser(new AuthenticationDetails({ Username, Password }), {
        onSuccess(result) {
          resolve(result.getRefreshToken().getToken())
        },
        onFailure(err) {
          reject(err)
        },
        newPasswordRequired(userAttributes) {
          delete userAttributes.email_verified
          user.completeNewPasswordChallenge(Password, userAttributes, {
            onSuccess(result) {
              resolve(result.getRefreshToken().getToken())
            },
            onFailure(err) {
              reject(err)
            },
          })
        },
      })
    )

    config.set('credentials.user', Username)
    config.set('credentials.refresh_token', refreshToken)
  } catch (e) {
    config.set('credentials.user', Username)
    config.del('credentials.refresh_token', 'credentials.token')
    throw e
  }
}

// TODO: verify jwt and check expiration instead of refreshing session every time
export const refreshToken = async () => {
  const Pool = new CognitoUserPool({
    UserPoolId: config.get('auth.user_pool_id'),
    ClientId: config.get('auth.client_id'),
  })

  try {
    const [Username, RefreshToken] = config.get('credentials.user', 'credentials.refresh_token')

    const user = new CognitoUser({ Username, Pool })

    const token = await new Promise((resolve, reject) =>
      user.refreshSession({ getToken: () => RefreshToken }, (err, session) => {
        if (err) {
          return reject(err)
        }
        return resolve(session.getIdToken().getJwtToken())
      })
    )

    config.set('credentials.token', token)
    return token
  } catch (error) {
    if (
      error != null &&
      error.message != null &&
      `${error.message}`.includes('Invalid Refresh Token')
    ) {
      logger.info({
        Username: config.get('credentials.user'),
        RefreshToken: config.get('credentials.refresh_token'),
        Token: config.get('credentials.token'),
      })
      config.del('credentials.user')
      config.del('credentials.refresh_token')
      config.del('credentials.token')
    }
    throw error
  }
}
