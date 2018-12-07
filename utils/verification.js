const { ERRORS: { INVALID_SUBDOMAIN_NAME } } = require('../constants')

const validateSubdomainName = name => {
  const errors = []
  const regexp = /^[\w-]+$/

  if (name.length > 63) {
    errors.push(INVALID_SUBDOMAIN_NAME.LENGTH)
  }

  if (name.startsWith('-') || name.endsWith('-')) {
    errors.push(INVALID_SUBDOMAIN_NAME.HYPHEN_START_END)
  }

  if (!regexp.test(name)) {
    errors.push(INVALID_SUBDOMAIN_NAME.ALPHA_NUMERIC)
  }
  return errors.join('\n')
}

module.exports = {
  validateSubdomainName
}
