const config = require('../config')
global.fetch = require('node-fetch')
const {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} = require('amazon-cognito-identity-js')

const { RESOLVE_CLIENT_ID, RESOLVE_USER_POOL_ID } = require('../constants')

const Pool = new CognitoUserPool({
  UserPoolId: RESOLVE_USER_POOL_ID,
  ClientId: RESOLVE_CLIENT_ID
})

const login = async (Username, Password) => {
  const user = new CognitoUser({ Username, Pool })

  try {
    const refreshToken = await new Promise((resolve, reject) =>
      user.authenticateUser(new AuthenticationDetails({ Username, Password }), {
        onSuccess(result) {
          resolve(result.getRefreshToken().getToken())
        },
        onFailure: reject
      })
    )

    config.set('credentials.user', Username)
    config.set('credentials.refreshToken', refreshToken)
  } catch (e) {
    config.set('credentials.user', Username)
    config.del('credentials.refreshToken', 'credentials.token')
    throw e
  }
}

const refreshToken = async () => {
  try {
    const [Username, RefreshToken] = config.get('cloud.user', 'cloud.refreshToken')

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
  } catch (err) {
    config.del('credentials.token')
    throw e
  }
}

module.exports = {
  login,
  refreshToken
}
