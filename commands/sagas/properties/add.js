const chalk = require('chalk')
const { post } = require('../../../api/client')
const refreshToken = require('../../../refreshToken')

const handler = refreshToken(async (token, { deployment, saga, name, value }) =>
  post(token, `deployments/${deployment}/sagas/${saga}/properties`, { name, value })
)

module.exports = {
  handler,
  command: `add <deployment> <saga> <name> <value>`,
  aliases: ['create'],
  describe: chalk.green('add new saga property'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('saga', {
        describe: chalk.green('application saga name'),
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
