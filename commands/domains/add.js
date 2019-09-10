const chalk = require('chalk')
const parseDomain = require('parse-domain')
const { escape } = require('querystring')
const isEmpty = require('lodash.isempty')
const refreshToken = require('../../refreshToken')
const { post, get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { domain: rawDomain }) => {
  const nameData = parseDomain(rawDomain)

  if (nameData == null || isEmpty(nameData.domain) || isEmpty(nameData.tld)) {
    throw Error(
      `Invalid domain name "${rawDomain}". The name should be a fully qualified second level domain name (e.g. root-domain.org) with a known top-level domain!`
    )
  }

  if (!isEmpty(nameData.subdomain)) {
    throw Error(`A domain name cannot contain a subdomain`)
  }

  const { domain, tld } = nameData
  const secondLevelDomain = `${domain}.${tld}`

  await post(token, `domains`, {
    domain: secondLevelDomain
  })

  const {
    result: { challenge, challengeRecordName = '_resolve-challenge' }
  } = await get(token, `domains/${escape(secondLevelDomain)}`)

  if (!challenge) {
    throw Error(`Unable to retrieve domain binding info.`)
  }

  out(
    `To verify your domain add a "${challengeRecordName}" TXT record with the "${challenge}" value to your DNS zone`
  )
})

module.exports = {
  handler,
  command: 'add <domain>',
  aliases: ['register'],
  describe: chalk.green("add a new domain name to the user's registry"),
  builder: yargs =>
    yargs.positional('domain', {
      describe: chalk.green('a custom domain name to add'),
      type: 'string'
    })
}
