const columnify = require('columnify')
const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { get } = require('../api/client')
const { out } = require('../utils/std')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await get(token, `deployments/${deployment}`)

  if (result) {
    out(columnify(result, { minWidth: 20, showHeaders: false }))
  }
})

module.exports = {
  handler,
  command: 'describe <deployment>',
  aliases: ['get'],
  describe: chalk.green('describe specific deployment'),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green('existing deployment id'),
      type: 'string'
    })
}
