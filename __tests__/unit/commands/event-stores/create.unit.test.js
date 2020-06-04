const path = require('path')
const FormData = require('form-data')
const nanoid = require('nanoid')
const { createReadStream } = require('fs')
const yargs = require('yargs')
const { post, get } = require('../../../../api/client')
const refreshToken = require('../../../../refreshToken')

const {
  command,
  handler,
  builder,
  describe: commandDescription
} = require('../../../../commands/event-stores/create')

jest.mock('fs')
jest.mock('../../../../api/client', () => ({
  post: jest.fn(),
  get: jest.fn()
}))
jest.mock('../../../../refreshToken', () => jest.fn(h => (...args) => h('token', ...args)))

const { option } = yargs
const { append: formDataAppend, getBoundary: formDataGetBoundary } = FormData.prototype

test('command', () => {
  expect(command).toEqual('create')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(option).toHaveBeenCalledWith('events', {
    describe: expect.any(String),
    type: 'string'
  })
  expect(option).toHaveBeenCalledWith('runtime', {
    describe: expect.any(String),
    type: 'string',
    default: 'latest'
  })
  expect(option).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  let routesGet
  let routesPost

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
    createReadStream.mockImplementation(name => path.basename(name))
    // eslint-disable-next-line func-names
    formDataAppend.mockImplementation(function(k, v) {
      this[k] = v
    })
    formDataGetBoundary.mockReturnValue('data-boundary')
  })

  beforeEach(() => {
    routesGet = {
      'upload/url?type=events&key=nanoid-value': () => ({ url: 'events-upload-url' })
    }
    routesPost = {
      'events-upload-url': () => {},
      eventStores: () => ({ eventStoreId: 'event-store-id' })
    }
  })

  afterEach(() => {
    refreshToken.mockClear()
    post.mockClear()
    createReadStream.mockClear()
    formDataAppend.mockClear()
    formDataGetBoundary.mockClear()
    FormData.mockClear()
    nanoid.mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('calls post with event store options', async () => {
    await handler({})

    expect(post).toBeCalledWith('token', `eventStores`, {
      runtime: undefined,
      initialEvents: null
    })
  })

  test('calls post with event store options if runtime is specified', async () => {
    await handler({ runtime: '0.0.0' })

    expect(post).toBeCalledWith('token', `eventStores`, {
      runtime: '0.0.0',
      initialEvents: null
    })
  })

  test('uploads events specified in options and then use them in post', async () => {
    await handler({ events: 'path/to/file' })

    const headers = {
      'Content-Type': `multipart/form-data; boundary=data-boundary`,
      'Content-Length': 333
    }

    expect(post).toHaveBeenCalledWith(null, 'events-upload-url', { file: 'file' }, headers)

    expect(post).toBeCalledWith('token', `eventStores`, {
      runtime: undefined,
      initialEvents: 'nanoid-value'
    })
  })
})
