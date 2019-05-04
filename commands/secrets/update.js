// TODO: route
const chalk = require('chalk')
const { put } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken((token, { deployment, name, value }) =>
  put(token, `deployments/${deployment}/secrets/${name}`, { value })
)

module.exports = {
  handler,
  command: 'update <deployment> <name> <value>',
  aliases: ['set'],
  describe: 'update secret variable value',
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('name', {
        describe: chalk.green('existing secret variable name'),
        type: 'string'
      })
      .positional('value', {
        describe: chalk.green('secret variable new value'),
        type: 'string'
      })
}
