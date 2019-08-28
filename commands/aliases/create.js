const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, {}) => post(token, `certificates`, {}))

module.exports = {
  handler,
  command: 'create <deploymentId> <alias>',
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
}
