import inquirer from 'inquirer'
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'

import * as config from '../config'
import { logger } from '../utils/std'
import { PASSWORD_REGEX } from '../constants'

export const isAuthError = (params: { errorText: string }) => {
  const { errorText } = params
  return (
    errorText.includes('Unable to find a signing key that matches') ||
    errorText.includes('Invalid Refresh Token')
  )
}

export const login = async (params: {
  username: string
  password: string
  userPoolId: string
  clientId: string
}) => {
  const { username, password, userPoolId, clientId } = params

  config.set('auth.user_pool_id', userPoolId)
  config.set('auth.client_id', clientId)

  const Pool = new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  })

  const user = new CognitoUser({ Username: username, Pool })

  try {
    const refreshToken = await new Promise((resolve, reject) =>
      user.authenticateUser(new AuthenticationDetails({ Username: username, Password: password }), {
        onSuccess(result) {
          resolve(result.getRefreshToken().getToken())
        },
        onFailure(err) {
          reject(err)
        },
        async newPasswordRequired(userAttributes) {
          const { NewPassword } = await inquirer.prompt([
            {
              type: 'password',
              name: 'NewPassword',
              message: 'Enter new password',
              mask: '*',
              validate: (input: string) => {
                if (!PASSWORD_REGEX.test(input)) {
                  return 'Password must have minimum 8 characters, at least one uppercase letter, one lowercase letter and one digit'
                }
                return true
              },
            },
          ])
          delete userAttributes.email_verified
          delete userAttributes.email
          user.completeNewPasswordChallenge(NewPassword, userAttributes, {
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

    config.set('credentials.user', username)
    config.set('credentials.refresh_token', refreshToken)
  } catch (e) {
    config.set('credentials.user', username)
    config.del('credentials.refresh_token', 'credentials.token')
    throw e
  }
}

export const logout = async () => {
  logger.info({
    Username: config.get('credentials.user'),
    RefreshToken: config.get('credentials.refresh_token'),
    Token: config.get('credentials.token'),
  })
  config.del('credentials.user')
  config.del('credentials.refresh_token')
  config.del('credentials.token')
}

export const isLoggedIn = () => {
  return (
    config.get('auth.user_pool_id') != null &&
    config.get('auth.client_id') != null &&
    config.get('credentials.user') != null &&
    config.get('credentials.refresh_token') != null
  )
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

    const token = await new Promise<string>((resolve, reject) =>
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
    if (isAuthError({ errorText: `${error}` })) {
      await logout()
    }

    if (`${error}`.includes('Username and Pool information are required')) {
      throw new Error('You must be logged in to use this command')
    }
    throw error
  }
}
