const mockData = [
  {
    deploymentId: 'deploymentId-1',
    applicationName: 'appname-1',
    lastUpdated: 'lastUpdated-1',
    url: 'url-1'
  },
  {
    deploymentId: 'deploymentId-2',
    applicationName: 'appname-2',
    lastUpdated: 'lastUpdated-2',
    url: 'url-2'
  }
]
const deployments = jest.fn().mockReturnValue(mockData)

jest.doMock('../../../utils/api', () => ({
  deployments
}))

const handler = require('../../../commands/deployments')

const infoSpy = jest.spyOn(console, 'info')
const errorSpy = jest.spyOn(console, 'error')

beforeEach(() => {
  deployments.mockClear()
  infoSpy.mockClear()
  errorSpy.mockClear()
})

describe('deployments', () => {
  test('default invoke', async () => {
    await handler()
    expect(deployments).toBeCalledWith()
    expect(infoSpy).toMatchSnapshot()
  })

  test('request failure', async () => {
    deployments.mockReturnValue(Promise.reject(Error('error')))

    await handler()
    expect(errorSpy).toBeCalledWith('error')
    expect(infoSpy).not.toBeCalled()
  })
})
