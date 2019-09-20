const log = require('consola')
const latestVersion = require('latest-version')
const chalk = require('chalk')
const { gt } = require('semver')
const { version, name } = require('./package')

const checkForUpdates = async () => {
  const availableVersion = await latestVersion(name)
  if (gt(availableVersion, version)) {
    log.warn(
      chalk.yellowBright(
        `New version ${chalk.green(
          availableVersion
        )} of the package available. Its highly recommended to upgrade.`
      )
    )
  }
}

const middleware = async ({ verbose }) => {
  log.level = verbose ? 5 : 1
  await checkForUpdates()
}

module.exports = middleware
