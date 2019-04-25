const { updateCloudConfig, getCloudConfig } = require('./config')
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

    await updateCloudConfig({ userName: Username, refreshToken })
  } catch (e) {
    await updateCloudConfig({ userName: Username, refreshToken: '', token: '' })
    throw e
  }
}

const refreshToken = async () => {
  const config = await getCloudConfig()

  const cognitoUser = new CognitoUser({ Username: config.userName, Pool })

  try {
    const token = await new Promise((resolve, reject) =>
      cognitoUser.refreshSession({ getToken: () => config.refreshToken }, (err, session) => {
        if (err) {
          return reject(err)
        }
        return resolve(session.getIdToken().getJwtToken())
      })
    )

    await updateCloudConfig({ token })
  } catch (err) {
    await updateCloudConfig({ token: '' })
    throw e
  }
}

module.exports = {
  login,
  refreshToken
}
