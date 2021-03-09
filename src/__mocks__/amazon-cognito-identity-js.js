/* eslint-disable */
class CognitoUserPool {
  constructor(params) {
    this.params = params
  }
}

let userAuthSuccess = true
let userRefreshSessionSuccess = true
const userConstructorMock = jest.fn()
const userRefreshSessionMock = jest.fn()
const userAuthenticateMock = jest.fn()

class CognitoUser {
  static get userAuthSuccess() {
    return userAuthSuccess
  }

  static set userAuthSuccess(success) {
    userAuthSuccess = success
  }

  static get userRefreshSessionSuccess() {
    return userRefreshSessionSuccess
  }

  static set userRefreshSessionSuccess(success) {
    userRefreshSessionSuccess = success
  }

  static get userConstructorMock() {
    return userConstructorMock
  }

  static get userRefreshSessionMock() {
    return userRefreshSessionMock
  }

  static get userAuthenticateMock() {
    return userAuthenticateMock
  }

  constructor(params) {
    this.params = params
    this.constructor.userConstructorMock(params)
  }

  authenticateUser(params, callbacks) {
    this.constructor.userAuthenticateMock(params)
    if (this.constructor.userAuthSuccess) {
      return callbacks.onSuccess({
        getRefreshToken: () => ({
          getToken: () => 'refreshToken',
        }),
      })
    }
    return callbacks.onFailure('auth error')
  }

  refreshSession(params, cb) {
    this.constructor.userRefreshSessionMock(params)
    if (this.constructor.userRefreshSessionSuccess) {
      return cb(null, {
        getIdToken: () => ({ getJwtToken: () => 'token' }),
      })
    }
    return cb('error', null)
  }
}

const authenticationDetailsConstructorMock = jest.fn()

class AuthenticationDetails {
  static get authenticationDetailsConstructorMock() {
    return authenticationDetailsConstructorMock
  }

  constructor(params) {
    this.params = params
    this.constructor.authenticationDetailsConstructorMock(params)
  }
}

module.exports = {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
}
