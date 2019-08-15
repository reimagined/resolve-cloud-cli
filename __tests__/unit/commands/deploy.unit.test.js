const path = require('path')
const FormData = require('form-data')
const { createReadStream } = require('fs')
const yargs = require('yargs')
const { post, get, put } = require('../../../api/client')
const refreshToken = require('../../../refreshToken')
const packager = require('../../../packager')
const { getPackageValue } = require('../../../config')
const {
  command,
  aliases,
  handler,
  builder,
  describe: commandDescription
} = require('../../../commands/deploy')

jest.mock('fs')
jest.mock('../../../api/client', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn()
}))
jest.mock('../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))
jest.mock('../../../packager', () => jest.fn())
jest.mock('../../../config', () => ({
  getPackageValue: jest.fn()
}))
jest.mock('../../../constants', () => ({
  DEPLOYMENT_STATE_AWAIT_INTERVAL_MS: 1
}))

const { option } = yargs
const { append: formDataAppend, getBoundary: formDataGetBoundary } = FormData.prototype

test('command', () => {
  expect(command).toEqual('deploy')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['$0'])
})

test('options', () => {
  builder(yargs)

  expect(option).toHaveBeenCalledWith('skipBuild', {
    describe: expect.any(String),
    type: 'boolean',
    default: false
  })
  expect(option).toHaveBeenCalledWith('configuration', {
    describe: expect.any(String),
    alias: 'c',
    type: 'string',
    default: 'cloud'
  })
  expect(option).toHaveBeenCalledWith('name', {
    describe: expect.any(String),
    alias: 'n',
    type: 'string'
  })
  expect(option).toHaveBeenCalledWith('deploymentId', {
    describe: expect.any(String),
    alias: 'd',
    type: 'string'
  })
  expect(option).toHaveBeenCalledWith('noWait', {
    describe: expect.any(String),
    type: 'boolean',
    default: false
  })
  expect(option).toHaveBeenCalledTimes(5)
})

describe('handler', () => {
  let routesGet
  let routesPost
  let routesPut

  beforeAll(() => {
    get.mockImplementation((_, route, ...args) =>
      Promise.resolve({
        result: routesGet[route](...args)
      })
    )
    post.mockImplementation((_, route, ...args) =>
      Promise.resolve({
        result: routesPost[route](...args)
      })
    )
    put.mockImplementation((_, route, ...args) =>
      Promise.resolve({
        result: routesPut[route](...args)
      })
    )
    getPackageValue.mockReturnValue('package-json-name')
    createReadStream.mockImplementation(name => path.basename(name))
    // eslint-disable-next-line func-names, eslint-disable prefer-arrow-callback
    formDataAppend.mockImplementation(function(k, v) {
      this[k] = v
    })
    formDataGetBoundary.mockReturnValue('data-boundary')
  })

  beforeEach(() => {
    routesGet = {
      deployments: () => [],
      'deployments/deployment-id': () => ({ state: 'ready' })
    }
    routesPost = {
      deployments: () => ({ id: 'deployment-id' }),
      upload: ({ file }) => ({ id: `id-${file}` })
    }
    routesPut = {
      'deployments/deployment-id': () => ({})
    }
  })

  afterEach(() => {
    getPackageValue.mockClear()
    refreshToken.mockClear()
    post.mockClear()
    get.mockClear()
    put.mockClear()
    createReadStream.mockClear()
    formDataAppend.mockClear()
    formDataGetBoundary.mockClear()
    FormData.mockClear()
    packager.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('package name from package.json', async () => {
    await handler({})

    expect(getPackageValue).toHaveBeenCalledWith('name', '')
  })

  test('files uploading', async () => {
    await handler({})

    const headers = { 'Content-Type': `multipart/form-data; boundary=data-boundary` }

    expect(FormData).toHaveBeenCalledTimes(2)
    expect(createReadStream).toHaveBeenCalledWith(path.resolve('code.zip'))
    expect(createReadStream).toHaveBeenCalledWith(path.resolve('static.zip'))

    expect(post).toHaveBeenCalledWith('token', 'upload', { file: 'code.zip' }, headers)
    expect(post).toHaveBeenCalledWith('token', 'upload', { file: 'static.zip' }, headers)
  })

  test('new deployment created', async () => {
    await handler({})

    expect(post).toHaveBeenCalledWith('token', 'deployments', {
      name: 'package-json-name'
    })
  })

  test('list of the user deployments requested', async () => {
    await handler({})

    expect(get).toHaveBeenCalledWith('token', 'deployments')
  })

  test('new deployment updated', async () => {
    await handler({})

    expect(put).toHaveBeenCalledWith('token', 'deployments/deployment-id', {
      name: 'package-json-name',
      codePackage: 'id-code.zip',
      staticPackage: 'id-static.zip'
    })
  })

  test('existing deployment updated', async () => {
    routesGet.deployments = () => [
      {
        name: 'package-json-name',
        id: 'existing-deployment-id'
      }
    ]
    routesGet['deployments/existing-deployment-id'] = () => ({ state: 'ready' })
    routesPut['deployments/existing-deployment-id'] = () => ({})

    await handler({})

    expect(put).toHaveBeenCalledWith('token', 'deployments/existing-deployment-id', {
      name: 'package-json-name',
      codePackage: 'id-code.zip',
      staticPackage: 'id-static.zip'
    })
  })

  test('multiple deployments with the same name existing', async () => {
    routesGet.deployments = () => [
      {
        name: 'package-json-name',
        id: 'existing-deployment-id-a'
      },
      {
        name: 'package-json-name',
        id: 'existing-deployment-id-b'
      }
    ]

    await expect(handler({})).rejects.toThrow(expect.any(Error))

    expect(put).not.toHaveBeenCalled()
    expect(post).not.toHaveBeenCalled()
  })

  test('awaiting for deployment ready', async () => {
    const states = ['deploying', 'ready']

    routesGet['deployments/deployment-id'] = () => ({ state: states.shift() })

    await handler({})

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id')
  })

  test('bug: awaiting for deployment ready only two iterations', async () => {
    const states = ['deploying', 'deploying', 'ready']

    const proxy = jest.fn(() => ({ state: states.shift() }))

    routesGet['deployments/deployment-id'] = proxy

    await handler({})

    expect(proxy).toHaveBeenCalledTimes(3)
  })

  test('deployment fall to error state', async () => {
    const states = ['deploying', 'error']

    routesGet['deployments/deployment-id'] = () => ({ state: states.shift() })

    await expect(handler({})).rejects.toBeInstanceOf(Error)
  })

  test('deployment fall to inconsistent state', async () => {
    const states = ['deploying', 'inconsistent']

    routesGet['deployments/deployment-id'] = () => ({ state: states.shift() })

    await expect(handler({})).rejects.toBeInstanceOf(Error)
  })

  test('packager invocation', async () => {
    await handler({ configuration: 'cloud' })

    expect(packager).toHaveBeenCalledWith('cloud', 'deployment-id')
  })

  test('option: name', async () => {
    await handler({ name: 'name-override' })

    expect(post).toHaveBeenCalledWith('token', 'deployments', { name: 'name-override' })
    expect(put).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id',
      expect.objectContaining({
        name: 'name-override'
      })
    )
  })

  test('option: skipBuild', async () => {
    await handler({ skipBuild: true })

    expect(packager).not.toHaveBeenCalled()
  })

  test('option: noWait', async () => {
    await handler({ noWait: true })

    expect(get).not.toHaveBeenCalledWith('token', 'deployments/deployment-id')
  })

  test('option: id (existing deployment)', async () => {
    routesGet.deployments = () => [
      {
        id: 'other-deployment-id',
        name: 'anything'
      },
      {
        id: 'specific-deployment-id',
        name: 'anything'
      }
    ]
    routesGet['deployments/specific-deployment-id'] = () => ({ state: 'ready' })
    routesPut['deployments/specific-deployment-id'] = () => ({})

    await handler({ deploymentId: 'specific-deployment-id' })

    expect(post).toHaveBeenCalledTimes(2)
    expect(put).toHaveBeenCalledWith(
      'token',
      'deployments/specific-deployment-id',
      expect.any(Object)
    )
    expect(get).toHaveBeenCalledWith('token', 'deployments/specific-deployment-id')
  })

  test('bugfix - option: id only one deployment', async () => {
    routesGet.deployments = () => [
      {
        id: 'specific-deployment-id',
        name: 'anything'
      }
    ]
    routesGet['deployments/specific-deployment-id'] = () => ({ state: 'ready' })
    routesPut['deployments/specific-deployment-id'] = () => ({})

    await handler({ deploymentId: 'specific-deployment-id' })

    expect(post).toHaveBeenCalledTimes(2)
  })

  test('option: id (no such deployment)', async () => {
    routesPost.deployments = () => ({ id: 'specific-deployment-id' })
    routesGet['deployments/specific-deployment-id'] = () => ({ state: 'ready' })
    routesPut['deployments/specific-deployment-id'] = () => ({})

    await handler({ deploymentId: 'specific-deployment-id' })

    expect(post).toHaveBeenCalledWith('token', 'deployments', {
      name: 'package-json-name',
      id: 'specific-deployment-id'
    })
    expect(put).toHaveBeenCalledWith(
      'token',
      'deployments/specific-deployment-id',
      expect.any(Object)
    )
    expect(get).toHaveBeenCalledWith('token', 'deployments/specific-deployment-id')
  })
})
