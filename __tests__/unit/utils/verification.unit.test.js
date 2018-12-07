const { ERRORS: { INVALID_SUBDOMAIN_NAME } } = require('../../../constants')

const { validateSubdomainName } = require('../../../utils/verification')

describe('application name validation', () => {
  test('appname validation', () => {
    expect(validateSubdomainName('123')).toHaveLength(0)
    expect(validateSubdomainName('test-app-name-multiple-dashes')).toHaveLength(0)
  })

  test('invalid app name [LENGTH]', () => {
    expect(validateSubdomainName('i'.repeat(64))).toBe(INVALID_SUBDOMAIN_NAME.LENGTH)
  })

  test('invalid app name [ALPHA_NUMERIC]', () => {
    expect(validateSubdomainName('helasdacz$#@78234world')).toBe(
      INVALID_SUBDOMAIN_NAME.ALPHA_NUMERIC
    )
  })

  test('invalid app name [HYPHEN_START_END]', () => {
    expect(validateSubdomainName('-asda')).toBe(INVALID_SUBDOMAIN_NAME.HYPHEN_START_END)
  })
})
