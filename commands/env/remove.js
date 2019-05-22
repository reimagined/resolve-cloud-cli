const chalk = require('chalk')
const { del } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken((token, { deployment, name }) =>
  del(token, `deployments/${deployment}/environment/${name}`)
)

module.exports = {
  handler,
  command: 'remove <deployment> <name>',
  aliases: ['rm'],
  describe: chalk.green('remove environment variable'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('name', {
        describe: chalk.green('environment variable name'),
        type: 'string'
      })
}
