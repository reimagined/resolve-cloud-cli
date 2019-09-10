const { escape } = require('querystring')
const dateFormat = require('dateformat')
const columnify = require('columnify')
const chalk = require('chalk')
const omit = require('lodash.omit')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { domain }) => {
  const { result } = await get(token, `domains/${escape(domain)}`)

  if (result) {
    out('--- INFO ---')
    out(
      columnify(
        {
          ...omit(result, 'bindings'),
          challenge: result.verified ? 'completed' : result.challenge,
          addedAt: dateFormat(new Date(result.addedAt), 'm/d/yy HH:MM:ss')
        },
        {
          minWidth: 20,
          showHeaders: false
        }
      )
    )
    out('--- BINDINGS ---')
    out(
      columnify(
        Object.keys(result.bindings).map(key => {
          const { certificateId, deploymentId, cname } = result.bindings[key]
          return {
            alias: key,
            cname,
            deployment: deploymentId,
            certificate: certificateId
          }
        }),
        {
          minWidth: 20,
          showHeaders: true,
          columns: ['alias', 'cname', 'deployment', 'certificate']
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
      describe: chalk.green('a registered domain name'),
      type: 'string'
    })
}
