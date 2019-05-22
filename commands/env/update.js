const chalk = require('chalk')
const { put } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken((token, { deployment, name, value }) =>
  put(token, `deployments/${deployment}/environment/${name}`, { value })
)

module.exports = {
  handler,
  command: 'update <deployment> <name> <value>',
  aliases: ['set'],
  describe: chalk.green('update existing environment variable value'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('name', {
        describe: chalk.green('existing variable name'),
        type: 'string'
      })
      .positional('value', {
        describe: chalk.green('new variable value'),
        type: 'string'
      })
}
