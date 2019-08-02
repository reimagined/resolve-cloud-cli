const chalk = require('chalk')
const { post } = require('../../../api/client')
const refreshToken = require('../../../refreshToken')

const handler = refreshToken(async (token, { deployment, saga, key, value }) =>
  post(token, `deployments/${deployment}/sagas/${saga}/properties`, { key, value })
)

module.exports = {
  handler,
  command: `add <deployment> <saga> <key> <value>`,
  aliases: ['create'],
  describe: chalk.green('add a new property'),
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
        describe: chalk.green('property value'),
        type: 'string'
      })
}
