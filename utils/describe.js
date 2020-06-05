const chalk = require('chalk')
const semver = require('semver')

const update = ({ major, minor, latestVersion }) => {
  const version = `${major}.${minor}.0`
  let versionChalk
  let updateText

  if (latestVersion != null) {
    if (semver.gt(latestVersion, version)) {
      versionChalk = chalk.yellowBright
      updateText = `-> ${latestVersion}`
    } else {
      versionChalk = chalk.green
      updateText = `up-to-date`
    }
  } else {
    versionChalk = chalk.redBright
    updateText = 'deprecated'
  }

  return {
    versionText: versionChalk(version),
    updateText: versionChalk(updateText)
  }
}

module.exports = {
  update
}
