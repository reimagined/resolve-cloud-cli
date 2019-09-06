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
      `Invalid domain name "${name}". Name should be a full-qualified subdomain name (e.g. store.root-domain.org) with known top-level domain!`
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

  out(`Add CNAME "${subdomain}" record with "${binding.cname}" value to your hosted zone`)
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
          'custom full-qualified name of available domains name to assign (e.g. store.root-domain.org)'
        ),
        type: 'string'
      })
      .positional('deployment', {
        describe: chalk.green("existing deployment's id"),
        type: 'string'
      })
      .option('certificate', {
        alias: 'cert',
        describe: 'SSL certificate id to use',
        type: 'string'
      })
}
