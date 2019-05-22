const chalk = require('chalk')
const { post } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken(async (token, { deployment, variable, value }) =>
  post(token, `deployments/${deployment}/environment`, { variable, value })
)

module.exports = {
  handler,
  command: `set <deployment> <variable> <value>`,
  aliases: ['create', 'add'],
  describe: chalk.green('set environment variable'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('variable', {
        describe: chalk.green('variable name'),
        type: 'string'
      })
      .positional('value', {
        describe: chalk.green('variable value'),
        type: 'string'
      })
}
