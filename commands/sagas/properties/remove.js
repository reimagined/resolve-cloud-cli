// TODO: route
// TODO: tests
const chalk = require('chalk')
const refreshToken = require('../../../refreshToken')
const { del } = require('../../../api/client')

const handler = refreshToken(async (token, { deployment, saga, name }) =>
  del(token, `deployments/${deployment}/sagas/${saga}/properties/${name}`)
)

module.exports = {
  handler,
  command: 'remove <deployment> <saga> <name>',
  aliases: ['rm'],
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
}
