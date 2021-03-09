test('', () => {})
/*
import path from 'path'
import FormData from 'form-data'
import { nanoid } from 'nanoid'
import { createReadStream } from 'fs'
import yargs from 'yargs'
import qr from 'qrcode-terminal'
import { mocked } from 'ts-jest/utils'

import { post, get, put } from '../../../api/client'
import refreshToken from '../../../refreshToken'
import packager from '../../../packager'
import { getApplicationIdentifier, getResolvePackageVersion } from '../../../config'
import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../commands/deploy'

jest.mock('fs')
jest.mock('../../../api/client', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
}))
jest.mock('../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
jest.mock('../../../packager', () => jest.fn())
jest.mock('../../../config', () => ({
  getApplicationIdentifier: jest.fn(() => 'application-name-0.21.0'),
  getResolvePackageVersion: jest.fn(() => '0.21.0'),
}))
jest.mock('../../../constants', () => ({
  DEPLOYMENT_STATE_AWAIT_INTERVAL_MS: 1,
  LATEST_RUNTIME_SPECIFIER: 'latest-runtime',
  COMPATIBILITY_VERSIONS: {
    3: [25],
    2: [24],
    1: [23, 22],
    0: [21],
  },
}))

const { option } = yargs
const { append: formDataAppend, getBoundary: formDataGetBoundary } = FormData.prototype

test('command', () => {
  expect(command).toEqual('deploy')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toBeUndefined()
})

test('options', () => {
  builder(yargs)

  expect(option).toHaveBeenCalledWith('skip-build', {
    describe: expect.any(String),
    type: 'boolean',
    default: false,
  })
  expect(option).toHaveBeenCalledWith('configuration', {
    describe: expect.any(String),
    alias: 'c',
    type: 'string',
    default: 'cloud',
  })
  expect(option).toHaveBeenCalledWith('name', {
    describe: expect.any(String),
    alias: 'n',
    type: 'string',
  })
  expect(option).toHaveBeenCalledWith('event-store-id', {
    describe: expect.any(String),
    alias: 'es',
    type: 'string',
  })
  expect(option).toHaveBeenCalledWith('events', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(option).toHaveBeenCalledWith('qr', {
    describe: expect.any(String),
    type: 'boolean',
    default: false,
  })
  expect(option).toHaveBeenCalledWith('environment', {
    describe: expect.any(String),
    alias: 'env',
    type: 'array',
  })
  expect(option).toHaveBeenCalledWith('npm-registry', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(option).toHaveBeenCalledWith('domain', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(option).toHaveBeenCalledTimes(9)
})

describe('handler', () => {
  let routesGet: any
  let routesPost: any
  let routesPut: any

  beforeAll(() => {
    mocked(get).mockImplementation((_, route, ...args) =>
      Promise.resolve({
        result: routesGet[route](...args),
      })
    )
    mocked(post).mockImplementation((_, route, ...args) =>
      Promise.resolve({
        result: routesPost[route](...args),
      })
    )
    mocked(put).mockImplementation((_, route, ...args) =>
      Promise.resolve({
        result: routesPut[route](...args),
      })
    )
    // mocked(getApplicationIdentifier).mockReturnValue('package-json-name')
    mocked(createReadStream).mockImplementation((name: any) => path.basename(name) as any)
    // eslint-disable-next-line func-names
    mocked(formDataAppend).mockImplementation(function (k, v) {
      this[k] = v
    })
    mocked(formDataGetBoundary).mockReturnValue('data-boundary')
  })

  beforeEach(() => {
    routesGet = {
      deployments: () => [],
      '/deployments': () => ({
        deploymentId: 'deployment-id',
        applicationName: 'application-name',
        version: '0.21.0',
        eventStoreId: 'event-store-id',
        domainName: 'domainName',
      }),
      'upload/url?type=deployment&key=nanoid-value': () => ({
        url: 'deployment-upload-url',
      }),
      'upload/url?type=events&key=nanoid-value': () => ({ url: 'events-upload-url' }),
      'upload/url?type=events&key=key-c': () => ({ url: 'events-upload-url-c' }),
      'upload/url?type=deployment&key=key-a': () => ({ url: 'deployment-upload-url-a' }),
      'upload/url?type=deployment&key=key-b': () => ({ url: 'deployment-upload-url-b' }),
      'eventStores/event-store-id': () => ({ eventStoreId: 'event-store-id' }),
      runtimes: () => [{ version: '0.0.0' }],
    }
    routesPost = {
      deployments: () => ({ id: 'deployment-id' }),
      'deployment-upload-url': () => {},
      'deployment-upload-url-a': () => {},
      'deployment-upload-url-b': () => {},
      'events-upload-url': () => {},
      'events-upload-url-c': () => {},
      eventStores: () => ({ eventStoreId: 'event-store-id' }),
    }
    routesPut = {
      'deployments/deployment-id': () => ({
        applicationUrl: 'app-url-from-deployment-update',
      }),
    }
  })

  afterEach(() => {
    mocked(getApplicationIdentifier).mockClear()
    mocked(getResolvePackageVersion).mockClear()
    mocked(refreshToken).mockClear()
    mocked(post).mockClear()
    mocked(get).mockClear()
    mocked(put).mockClear()
    mocked(createReadStream).mockClear()
    mocked(formDataAppend).mockClear()
    mocked(formDataGetBoundary).mockClear()
    mocked(FormData).mockClear()
    mocked(packager).mockClear()
    mocked(nanoid).mockClear()
    mocked(qr.generate).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('package name from package.json', async () => {
    await handler({})

    expect(getApplicationIdentifier).toHaveBeenCalledWith('name', '')
  })

  test('failed deployment with unsupported resolve version', async () => {
    mocked(getResolvePackageVersion).mockReturnValueOnce('0.0.0')

    await expect(handler({})).rejects.toThrowError(
      'This resolve version is not supported by the cloud. Please use a more recent version.'
    )
  })

  test('failed deployment with incompatible resolve version', async () => {
    mocked(getResolvePackageVersion).mockReturnValueOnce('0.25.0')

    await expect(handler({})).rejects.toThrowError(
      'Application deployment error. The runtime version used is only compatible with 0.21.x resolve version.'
    )
  })

  test('deployment files uploading', async () => {
    mocked(nanoid).mockReturnValueOnce('key-a')
    mocked(nanoid).mockReturnValueOnce('key-b')

    await handler({})

    const headers = {
      'Content-Type': `multipart/form-data; boundary=data-boundary`,
      'Content-Length': 333,
    }

    expect(get).toHaveBeenCalledWith('token', 'upload/url?type=deployment&key=key-a')
    expect(get).toHaveBeenCalledWith('token', 'upload/url?type=deployment&key=key-b')

    expect(FormData).toHaveBeenCalledTimes(2)
    expect(createReadStream).toHaveBeenCalledWith(path.resolve('code.zip'))
    expect(createReadStream).toHaveBeenCalledWith(path.resolve('static.zip'))

    expect(post).toHaveBeenCalledWith(
      null,
      'deployment-upload-url-a',
      { file: 'code.zip' },
      headers
    )
    expect(post).toHaveBeenCalledWith(
      null,
      'deployment-upload-url-b',
      { file: 'static.zip' },
      headers
    )
  })

  test('initial events file uploading', async () => {
    mocked(nanoid).mockReturnValueOnce('key-c')
    mocked(nanoid).mockReturnValueOnce('key-a')
    mocked(nanoid).mockReturnValueOnce('key-b')

    await handler({
      events: 'events.txt',
    })

    const headers = {
      'Content-Type': `multipart/form-data; boundary=data-boundary`,
      'Content-Length': 333,
    }

    expect(get).toHaveBeenCalledWith('token', 'upload/url?type=events&key=key-c')
    expect(createReadStream).toHaveBeenCalledWith(path.resolve('events.txt'))
    expect(post).toHaveBeenCalledWith(null, 'events-upload-url-c', { file: 'events.txt' }, headers)
  })

  test('new deployment created', async () => {
    await handler({})

    expect(post).toHaveBeenCalledWith('token', 'deployments', {
      name: 'package-json-name',
      initialEvents: null,
      eventStoreId: 'event-store-id',
      runtime: undefined,
      id: undefined,
    })
  })

  test('creates event store for new deployment', async () => {
    await handler({})

    expect(post).toHaveBeenCalledWith('token', 'eventStores', {
      initialEvents: null,
      runtime: undefined,
    })
  })

  test('uses existing event store for new deployment', async () => {
    await handler({ 'event-store-id': 'event-store-id' })

    expect(post).not.toHaveBeenCalledWith('token', 'eventStores', expect.any(Object))
  })

  test('list of the user deployments requested', async () => {
    await handler({})

    expect(get).toHaveBeenCalledWith('token', 'deployments')
  })

  test('new deployment updated', async () => {
    mocked(nanoid).mockReturnValueOnce('key-a')
    mocked(nanoid).mockReturnValueOnce('key-b')

    await handler({})

    expect(put).toHaveBeenCalledWith('token', 'deployments/deployment-id', {
      name: 'package-json-name',
      codePackage: 'key-a',
      staticPackage: 'key-b',
      initialEvents: null,
      environment: null,
    })
  })

  test('existing deployment updated', async () => {
    routesGet.deployments = () => [
      {
        name: 'package-json-name',
        id: 'existing-deployment-id',
      },
    ]
    routesGet['deployments/existing-deployment-id'] = () => ({ status: 'ready' })
    routesPut['deployments/existing-deployment-id'] = () => ({})

    await handler({})

    expect(put).toHaveBeenCalledWith('token', 'deployments/existing-deployment-id', {
      name: 'package-json-name',
      codePackage: 'nanoid-value',
      staticPackage: 'nanoid-value',
      initialEvents: null,
      environment: null,
    })
  })

  test('cannot change existing deployment runtime', async () => {
    routesGet.deployments = () => [
      {
        name: 'package-json-name',
        id: 'existing-deployment-id',
      },
    ]
    routesGet['deployments/existing-deployment-id'] = () => ({ status: 'ready' })
    routesPut['deployments/existing-deployment-id'] = () => ({})

    await expect(
      handler({
        runtime: 'new-runtime',
      })
    ).rejects.toBeInstanceOf(Error)

    expect(put).not.toHaveBeenCalled()
  })

  test('multiple deployments with the same name existing', async () => {
    routesGet.deployments = () => [
      {
        name: 'package-json-name',
        id: 'existing-deployment-id-a',
      },
      {
        name: 'package-json-name',
        id: 'existing-deployment-id-b',
      },
    ]

    await expect(handler({})).rejects.toThrow(expect.any(Error))

    expect(put).not.toHaveBeenCalled()
    expect(post).not.toHaveBeenCalled()
  })

  test('awaiting for deployment ready', async () => {
    const states = ['deploying', 'ready']

    routesGet['deployments/deployment-id'] = () => ({ status: states.shift() })

    await handler({ wait: true })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id')
  })

  test('bug: awaiting for deployment ready only two iterations', async () => {
    const states = ['deploying', 'deploying', 'ready']

    const proxy = jest.fn(() => ({ status: states.shift() }))

    routesGet['deployments/deployment-id'] = proxy

    await handler({ wait: true })

    expect(proxy).toHaveBeenCalledTimes(3)
  })

  test('deployment fall to error state', async () => {
    const statuses = ['deploying', 'error']

    routesGet['deployments/deployment-id'] = () => ({
      status: statuses.shift(),
      error: 'failure-reason',
    })

    await expect(handler({ wait: true })).rejects.toThrow('failure-reason')
  })

  test('deployment fall to inconsistent state', async () => {
    const states = ['deploying', 'inconsistent']

    routesGet['deployments/deployment-id'] = () => ({ status: states.shift() })

    await expect(handler({ wait: true })).rejects.toBeInstanceOf(Error)
  })

  test('deployment fall to deploy-error state', async () => {
    const states = ['deploying', 'deploy-error']

    routesGet['deployments/deployment-id'] = () => ({ status: states.shift() })

    await expect(handler({ wait: true })).rejects.toBeInstanceOf(Error)
  })

  test('packager invocation', async () => {
    await handler({ configuration: 'cloud' })

    expect(packager).toHaveBeenCalledWith('cloud', 'deployment-id')
  })

  test('option: name', async () => {
    await handler({ name: 'name-override' })

    expect(post).toHaveBeenCalledWith('token', 'deployments', {
      name: 'name-override',
      eventStoreId: 'event-store-id',
      initialEvents: null,
      id: undefined,
      runtime: undefined,
    })
    expect(put).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id',
      expect.objectContaining({
        name: 'name-override',
      })
    )
  })

  test('option: skipBuild', async () => {
    await handler({ 'skip-build': true })

    expect(packager).not.toHaveBeenCalled()
  })

  test('option: wait', async () => {
    await handler({ wait: false })

    expect(get).not.toHaveBeenCalledWith('token', 'deployments/deployment-id')
  })

  test('option: id (existing deployment)', async () => {
    routesGet.deployments = () => [
      {
        id: 'other-deployment-id',
        name: 'anything',
      },
      {
        id: 'specific-deployment-id',
        name: 'anything',
      },
    ]
    routesGet['deployments/specific-deployment-id'] = () => ({ status: 'ready' })
    routesPut['deployments/specific-deployment-id'] = () => ({})

    await handler({ wait: true, 'deployment-id': 'specific-deployment-id' })

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
        name: 'anything',
      },
    ]
    routesGet['deployments/specific-deployment-id'] = () => ({ status: 'ready' })
    routesPut['deployments/specific-deployment-id'] = () => ({})

    await handler({ 'deployment-id': 'specific-deployment-id' })

    expect(post).toHaveBeenCalledTimes(2)
  })

  test('option: id (no such deployment)', async () => {
    routesPost.deployments = () => ({ id: 'specific-deployment-id' })
    routesGet['deployments/specific-deployment-id'] = () => ({ status: 'ready' })
    routesPut['deployments/specific-deployment-id'] = () => ({})

    await handler({ wait: true, deploymentId: 'specific-deployment-id' })

    expect(post).toHaveBeenCalledWith('token', 'deployments', {
      name: 'package-json-name',
      id: undefined,
      runtime: undefined,
      eventStoreId: 'event-store-id',
      initialEvents: null,
    })
    expect(put).toHaveBeenCalledWith(
      'token',
      'deployments/specific-deployment-id',
      expect.any(Object)
    )
    expect(get).toHaveBeenCalledWith('token', 'deployments/specific-deployment-id')
  })

  test('option: qr code not generated by default', async () => {
    await handler({})

    expect(qr.generate).not.toHaveBeenCalled()
  })

  test('option: qr code generated', async () => {
    await handler({ qr: true })

    expect(qr.generate).toHaveBeenCalledWith('app-url-from-deployment-update', expect.any(Object))
  })

  test('option: environment variables', async () => {
    await handler({
      environment: ['a=a', 'b=b'],
    })

    expect(put).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id',
      expect.objectContaining({
        environment: {
          a: 'a',
          b: 'b',
        },
      })
    )
  })

  test('option: npm-registry', async () => {
    await handler({ 'npm-registry': 'http://custom.registry.org' })

    expect(put).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id',
      expect.objectContaining({
        npmRegistry: 'http://custom.registry.org',
      })
    )
  })
})
*/
