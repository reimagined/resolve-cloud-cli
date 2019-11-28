const columnify = require('columnify')
const semver = require('semver')
const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { get } = require('../api/client')
const { out } = require('../utils/std')

const handler = refreshToken(async token => {
  const { result } = await get(token, `deployments`)

  if (result) {
    out(
      columnify(
        result.map(({ id, name, version, latestVersion }) => {
          let versionChalk
          let latestText

          if (latestVersion) {
            if (semver.gt(latestVersion, version)) {
              versionChalk = chalk.yellowBright
              latestText = `-> ${latestVersion}`
            } else {
              versionChalk = chalk.green
              latestText = `up-to-date`
            }
          } else {
            versionChalk = chalk.redBright
            latestText = 'deprecated'
          }

          return {
            id,
            name,
            version: versionChalk(version),
            update: versionChalk(latestText)
          }
        }),
        {
          minWidth: 30
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
