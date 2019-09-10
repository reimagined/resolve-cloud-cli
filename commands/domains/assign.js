const { escape } = require('querystring')
const chalk = require('chalk')
const parseDomain = require('parse-domain')
const isEmpty = require('lodash.isempty')
const refreshToken = require('../../refreshToken')
const { post, get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { name, deployment, certificate }) => {
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

  await post(token, `domains/${escapedRootDomain}/assign`, {
    subdomain,
    deploymentId: deployment,
    certificateId: certificate
  })

  const {
    result: { bindings }
  } = await get(token, `domains/${escapedRootDomain}`)
  const binding = bindings[name]

  if (!binding || !binding.cname) {
    throw Error(`Unable to retrieve domain binding info.`)
  }

  out(`Add a CNAME "${subdomain}" record with the "${binding.cname}" value to your DNS zone`)
})

module.exports = {
  handler,
  command: 'assign <name> <deployment>',
  aliases: ['bind'],
  describe: chalk.green('assign a custom domain name to a specific deployment'),
  builder: yargs =>
    yargs
      .positional('name', {
        describe: chalk.green(
          'an existing custom domain name in fully qualified format (e.g. store.root-domain.org)'
        ),
        type: 'string'
      })
      .positional('deployment', {
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .option('certificate', {
        alias: 'cert',
        describe: 'the id of an SSL certificate to use',
        type: 'string'
      })
}
