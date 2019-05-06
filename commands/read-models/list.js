const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')

const handler = refreshToken(async (token, { deployment }) =>
  get(token, `deployments/${deployment}/read-models`)
)

module.exports = {
  handler,
  command: 'list <deployment>',
  aliases: ['ls', '$0'],
  describe: chalk.green('show read model list'),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green('existing deployment id'),
      type: 'string'
    })
}
