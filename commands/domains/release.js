const { escape } = require('querystring')
const chalk = require('chalk')
const parseDomain = require('parse-domain')
const isEmpty = require('lodash.isempty')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { name }) => {
  const nameData = parseDomain(name)

  if (
    nameData == null ||
    isEmpty(nameData.subdomain) ||
    isEmpty(nameData.domain) ||
    isEmpty(nameData.tld)
  ) {
    throw Error(
      `Invalid domain name "${name}". The name should be a fully qualified second level domain name (e.g. root-domain.org) with a known top-level domain!`
    )
  }

  const { subdomain, domain, tld } = nameData
  const escapedRootDomain = escape(`${domain}.${tld}`)

  await post(token, `domains/${escapedRootDomain}/release`, {
    subdomain
  })
})

module.exports = {
  handler,
  command: 'release <name>',
  aliases: ['unbind'],
  describe: chalk.green('release a custom domain name'),
  builder: yargs =>
    yargs.positional('name', {
      describe: chalk.green('a custom domain name to release'),
      type: 'string'
    })
}
