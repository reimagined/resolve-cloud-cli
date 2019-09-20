const log = require('consola')
const latestVersion = require('latest-version')
const chalk = require('chalk')
const { gt } = require('semver')
const { version, name } = require('./package')

const verbosityLevels = {
  silent: -1,
  normal: 3,
  debug: 4,
  trace: 5
}

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

const middleware = async ({ verbose, verbosity }) => {
  const actualVerbosity = verbosity || (verbose ? 'debug' : 'normal')
  log.level = verbosityLevels[actualVerbosity] || 3
  await checkForUpdates()
}

module.exports = middleware
