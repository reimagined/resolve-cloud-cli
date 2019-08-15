const columnify = require('columnify')
const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { get } = require('../api/client')
const { out } = require('../utils/std')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await get(token, `deployments/${deployment}`)

  if (result) {
    out(
      columnify(
        {
          ...result,
          error: result.error || 'N\\A'
        },
        { minWidth: 20, showHeaders: false }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'describe <deployment>',
  aliases: ['get'],
  describe: chalk.green('display information on the specified deployment'),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string'
    })
}
