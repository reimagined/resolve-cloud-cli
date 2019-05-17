const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { del } = require('../api/client')

const handler = refreshToken(async (token, { deployment }) =>
  del(token, `deployments/${deployment}`)
)

module.exports = {
  handler,
  command: 'remove <deployment>',
  aliases: ['rm'],
  describe: chalk.green('remove specific deployment and all its data'),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green('existing deployment id'),
      type: 'string'
    })
}
