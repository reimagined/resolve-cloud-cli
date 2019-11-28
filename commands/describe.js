const columnify = require('columnify')
const omit = require('lodash.omit')
const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { get } = require('../api/client')
const { out } = require('../utils/std')
const { update: describeUpdate } = require('../utils/describe')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await get(token, `deployments/${deployment}`)

  if (result) {
    const { versionText, updateText } = describeUpdate(result)
    out(
      columnify(
        {
          ...omit(result, 'latestVersion'),
          error: result.error || 'N\\A',
          version: versionText,
          update: updateText
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
