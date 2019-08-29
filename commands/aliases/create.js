const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { deployment, alias, certificate }) =>
  post(token, `aliases`, {
    deployment,
    alias,
    certificate
  })
)

module.exports = {
  handler,
  command: 'create <deployment> <alias>',
  aliases: ['set'],
  describe: chalk.green('create a new alias for a deployment'),
  builder: yargs =>
    yargs
      .positional('deploymentId', {
        describe: chalk.green('an id of an existing deployment'),
        type: 'string'
      })
      .positional('alias', {
        describe: chalk.green('custom domain name'),
        type: 'string'
      })
      .option('certificate', {
        alias: 'cert',
        describe: 'an id of imported SSL certificate',
        type: 'string'
      })
}
