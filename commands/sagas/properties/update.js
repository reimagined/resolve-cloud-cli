// TODO: route
// TODO: tests
const chalk = require('chalk')
const refreshToken = require('../../../refreshToken')
const { put } = require('../../../api/client')

const handler = refreshToken(async (token, { deployment, saga, name, value }) =>
  put(token`${deployment}/sagas/${saga}/properties/${name}`, { value })
)

module.exports = {
  handler,
  command: 'update <deployment> <saga> <name> <value>',
  aliases: ['set'],
  describe: chalk.green('remove saga property'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('saga', {
        describe: chalk.green('existing saga name'),
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
