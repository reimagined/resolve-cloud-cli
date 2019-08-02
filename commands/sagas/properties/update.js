const chalk = require('chalk')
const refreshToken = require('../../../refreshToken')
const { put } = require('../../../api/client')

const handler = refreshToken(async (token, { deployment, saga, name, value }) =>
  put(token, `deployments/${deployment}/sagas/${saga}/properties/${name}`, { value })
)

module.exports = {
  handler,
  command: 'update <deployment> <saga> <name> <value>',
  aliases: ['set'],
  describe: chalk.green('update a saga property'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .positional('saga', {
        describe: chalk.green("an existing saga's name"),
        type: 'string'
      })
      .positional('name', {
        describe: chalk.green('property name'),
        type: 'string'
      })
      .positional('value', {
        describe: chalk.green('property name'),
        type: 'string'
      })
}
