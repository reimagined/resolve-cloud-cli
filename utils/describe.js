const chalk = require('chalk')
const semver = require('semver')

const update = ({ version, latestVersion }) => {
  let versionChalk
  let updateText

  if (latestVersion) {
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
