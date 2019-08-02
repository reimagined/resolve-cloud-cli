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
  describe: chalk.green('remove a saga property'),
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
}
