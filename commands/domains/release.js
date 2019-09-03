const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { domain }) => post(token, `domains`, { domain }))

module.exports = {
  handler,
  command: 'release <domain>',
  aliases: ['unbind'],
  describe: chalk.green('release a domain name from any deployment'),
  builder: yargs =>
    yargs.positional('domain', {
      describe: chalk.green('domain name to release'),
      type: 'string'
    })
}
