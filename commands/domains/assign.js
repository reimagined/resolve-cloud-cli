const { escape } = require('querystring')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { domain, deployment, certificate }) =>
  post(token, `domains/${escape(domain)}/assign`, {
    deploymentId: deployment,
    certificateId: certificate
  })
)

module.exports = {
  handler,
  command: 'assign <domain> <deployment>',
  aliases: ['bind'],
  describe: chalk.green('assign a domain name to a specific deployment'),
  builder: yargs =>
    yargs
      .positional('domain', {
        describe: chalk.green('domain name to assign'),
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
