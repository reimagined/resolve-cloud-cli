const { escape } = require('querystring')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { domain }) =>
  post(token, `domains/${escape(domain)}/verify`)
)

module.exports = {
  handler,
  command: 'verify <domain>',
  describe: chalk.green('request domain verification'),
  builder: yargs =>
    yargs.positional('domain', {
      describe: chalk.green('a registered domain name'),
      type: 'string'
    })
}
