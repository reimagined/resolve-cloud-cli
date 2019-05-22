const chalk = require('chalk')
const { del } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken((token, { deployment, variable }) =>
  del(token, `deployments/${deployment}/environment/${variable}`)
)

module.exports = {
  handler,
  command: 'remove <deployment> <variable>',
  aliases: ['rm'],
  describe: chalk.green('remove environment variable'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('variable', {
        describe: chalk.green('environment variable name'),
        type: 'string'
      })
}
