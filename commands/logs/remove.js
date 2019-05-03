// TODO: route
// TODO: tests
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { del } = require('../../api/client')

const handler = refreshToken((token, { deployment }) =>
  del(token, `deployments/${deployment}/logs`)
)

module.exports = {
  handler,
  command: 'remove <deployment>',
  aliases: ['rm'],
  describe: chalk.green('delete all application logs (cannot be undone)'),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green('existing deployment id'),
      type: 'string'
    })
}
