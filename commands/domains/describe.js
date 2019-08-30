const { escape } = require('querystring')
const dateFormat = require('dateformat')
const columnify = require('columnify')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { domain }) => {
  const { result } = await get(token, `domains/${escape(domain)}`)

  if (result) {
    out(
      columnify(
        {
          ...result,
          challenge: result.verified ? 'completed' : result.challenge,
          addedAt: dateFormat(new Date(result.addedAt), 'm/d/yy HH:MM:ss')
        },
        {
          minWidth: 20,
          showHeaders: false
        }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'describe <domain>',
  aliases: ['get'],
  describe: chalk.green('display information on the specified domain'),
  builder: yargs =>
    yargs.positional('domain', {
      describe: chalk.green('registered domain name'),
      type: 'string'
    })
}
