const chalk = require('chalk')
const { post } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken(async (token, { deployment, name, value }) =>
  post(token, `deployments/${deployment}/environment`, { name, value })
)

module.exports = {
  handler,
  command: `add <deployment> <name> <value>`,
  aliases: ['create'],
  describe: chalk.green('add new environment variable'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('name', {
        describe: chalk.green('variable name'),
        type: 'string'
      })
      .positional('value', {
        describe: chalk.green('variable value'),
        type: 'string'
      })
}
