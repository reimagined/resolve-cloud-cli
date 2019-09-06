const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

// TODO: add domain verification
const handler = refreshToken(async (token, { domain }) => post(token, `domains`, { domain }))

module.exports = {
  handler,
  command: 'add <domain>',
  aliases: ['register'],
  describe: chalk.green("add a new domain name to user's registry"),
  builder: yargs =>
    yargs.positional('domain', {
      describe: chalk.green('custom domain name to add'),
      type: 'string'
    })
}
