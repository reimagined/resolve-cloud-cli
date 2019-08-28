const { escape } = require('querystring')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { del } = require('../../api/client')

const handler = refreshToken(async (token, { domain }) => del(token, `domains/${escape(domain)}`))

module.exports = {
  handler,
  command: 'rm <domain>',
  aliases: ['remove', 'delete'],
  describe: chalk.green('removes an existing domain'),
  builder: yargs =>
    yargs.positional('domain', {
      describe: chalk.green('a name of registered domain'),
      type: 'string'
    })
}
