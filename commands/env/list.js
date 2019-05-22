const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')

const handler = refreshToken((token, { deployment }) =>
  get(token, `deployments/${deployment}/environment`)
)

module.exports = {
  handler,
  command: 'list <deployment>',
  aliases: ['ls', '$0'],
  describe: chalk.green('list all environment variables'),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green('existing deployment id'),
      type: 'string'
    })
}
