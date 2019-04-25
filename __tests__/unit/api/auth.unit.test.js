const {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserPool
} = require('amazon-cognito-identity-js')

jest.doMock('../../../constants', () => ({
  RESOLVE_CLIENT_ID: 'client_id',
  RESOLVE_USER_POOL_ID: 'user_pool_id'
}))

const getCloudConfig = jest.fn().mockReturnValue({
  userName: 'John Smith',
  refreshToken: 'refreshToken'
})
const updateCloudConfig = jest.fn()

jest.doMock('../../../utils/config', () => ({
  getCloudConfig,
  updateCloudConfig
}))

const { login, refreshToken } = require('../../../api/auth')

const Pool = new CognitoUserPool({
  UserPoolId: 'user_pool_id',
  ClientId: 'client_id'
})

describe('login', () => {
  afterEach(() => {
    updateCloudConfig.mockClear()
    CognitoUser.userConstructorMock.mockClear()
    CognitoUser.userAuthenticateMock.mockClear()
    AuthenticationDetails.authenticationDetailsConstructorMock.mockClear()
  })

  test('success', async () => {
    CognitoUser.userAuthSuccess = true
    await login('John Smith', 'qwerty')
    expect(AuthenticationDetails.authenticationDetailsConstructorMock).toBeCalledWith({
      Username: 'John Smith',
      Password: 'qwerty'
    })
    expect(CognitoUser.userConstructorMock).toBeCalledWith({ Username: 'John Smith', Pool })
    expect(CognitoUser.userAuthenticateMock).toBeCalledWith(
      new AuthenticationDetails({
        Username: 'John Smith',
        Password: 'qwerty'
      })
    )
    expect(updateCloudConfig).toBeCalledWith({
      userName: 'John Smith',
      refreshToken: 'refreshToken'
    })
  })

  test('authenticateUser failed', async () => {
    CognitoUser.userAuthSuccess = false
    await login('John Smith', 'qwerty')
    expect(AuthenticationDetails.authenticationDetailsConstructorMock).toBeCalledWith({
      Username: 'John Smith',
      Password: 'qwerty'
    })
    expect(CognitoUser.userConstructorMock).toBeCalledWith({ Username: 'John Smith', Pool })
    expect(CognitoUser.userAuthenticateMock).toBeCalledWith(
      new AuthenticationDetails({
        Username: 'John Smith',
        Password: 'qwerty'
      })
    )
    expect(updateCloudConfig).toBeCalledWith({
      userName: 'John Smith',
      refreshToken: '',
      token: ''
    })
  })
})

describe('refreshToken', () => {
  afterEach(() => {
    updateCloudConfig.mockClear()
    CognitoUser.userConstructorMock.mockClear()
    CognitoUser.userRefreshSessionMock.mockClear()
  })

  test('success', async () => {
    CognitoUser.userRefreshSessionSuccess = true
    await refreshToken('John Smith', 'qwerty')
    expect(getCloudConfig).toBeCalled()
    expect(CognitoUser.userConstructorMock).toBeCalledWith({ Username: 'John Smith', Pool })
    expect(CognitoUser.userRefreshSessionMock.mock.calls[0][0].getToken()).toBe('refreshToken')
    expect(updateCloudConfig).toBeCalledWith({ token: 'token' })
  })

  test('refreshSession failed', async () => {
    CognitoUser.userRefreshSessionSuccess = false
    await refreshToken('John Smith', 'qwerty')
    expect(getCloudConfig).toBeCalled()
    expect(CognitoUser.userConstructorMock).toBeCalledWith({ Username: 'John Smith', Pool })
    expect(CognitoUser.userRefreshSessionMock.mock.calls[0][0].getToken()).toBe('refreshToken')
    expect(updateCloudConfig).toBeCalledWith({ token: '' })
  })
})
