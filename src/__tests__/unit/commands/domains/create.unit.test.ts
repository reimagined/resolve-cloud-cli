import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/domains/create'
import { post } from '../../../../api/client'
import { logger } from '../../../../utils/std'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  post: jest.fn(),
  get: jest.fn(),
}))
jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
jest.mock('../../../../utils/std', () => ({
  out: jest.fn(),
  logger: {
    log: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    start: jest.fn(),
    success: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
    level: jest.fn(),
  },
}))
jest.mock('querystring', () => ({
  escape: jest.fn(() => 'escaped-string'),
}))

const { option } = yargs

test('command', () => {
  expect(command).toEqual('create')
  expect(aliases).toEqual(expect.arrayContaining(['register']))
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(option).toHaveBeenCalledWith('certificate-id', {
    describe: expect.any(String),
    alias: 'cert',
    type: 'string',
    demand: 'a certificate id is required',
  })
  expect(option).toHaveBeenCalledWith('aliases', {
    describe: expect.any(String),
    alias: 'a',
    type: 'string',
    demand: 'an aliases is required',
  })
  expect(option).toHaveBeenCalledWith('domain-id', {
    describe: expect.any(String),
    alias: 'id',
    type: 'string',
  })
  expect(option).toHaveBeenCalledTimes(3)
})

describe('handler', () => {
  beforeAll(() => {
    mocked(post).mockResolvedValue({
      result: {
        DomainName: 'domain-name',
        DomainId: 'domain-id',
      },
    })
  })

  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(post).mockClear()
  })

  // test('wrapped with refreshToken', async () => {
  //   await handler({})
  //
  //   expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  // })
  //
  // test('api call', async () => {
  //   await handler({
  //     'certificate-id': 'certificateId',
  //     aliases: 'alias1,alias2',
  //     'domain-id': 'domainId',
  //   })
  //
  //   expect(post).toHaveBeenCalledWith('token', 'domains', {
  //     certificateId: 'certificateId',
  //     aliases: 'alias1,alias2',
  //     domainId: 'domainId',
  //   })
  // })

  test('output', async () => {
    await handler({
      'certificate-id': 'certificateId',
      aliases: 'alias1,alias2',
      'domain-id': 'domainId',
    })

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Your domain "domain-name" with id "domain-id"')
    )
  })
})
