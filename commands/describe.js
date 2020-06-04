const columnify = require('columnify')
const omit = require('lodash.omit')
const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { get } = require('../api/client')
const { out } = require('../utils/std')
const { update: describeUpdate } = require('../utils/describe')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await get(token, `deployments/${deployment}`)

  if (result.error == null || result.error === '') {
    result.error = 'N\\A'
  }

  if (result) {
    const { versionText, updateText } = describeUpdate(result)
    out(
      columnify(
        {
          ...omit(result, 'latestVersion', 'errors'),
          error: result.error,
          version: versionText,
          update: updateText
        },
        { minWidth: 20, showHeaders: false, preserveNewLines: true }
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
