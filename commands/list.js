const columnify = require('columnify')
const chalk = require('chalk')
const omit = require('lodash.omit')
const refreshToken = require('../refreshToken')
const { get } = require('../api/client')
const { out } = require('../utils/std')
const { update: describeUpdate } = require('../utils/describe')

const handler = refreshToken(async token => {
  const { result } = await get(token, `deployments`)

  if (result) {
    out(
      columnify(
        result
          .concat()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(item => {
            const { versionText, updateText } = describeUpdate(item)

            return {
              ...omit(item, 'latestVersion', 'lastUpdatedAt', 'major', 'minor'),
              version: versionText,
              update: updateText
            }
          }),
        {
          minWidth: 30,
          config: {
            version: { minWidth: 10 }
          }
        }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'list',
  aliases: ['ls'],
  describe: chalk.green('display a list of available deployments')
}
