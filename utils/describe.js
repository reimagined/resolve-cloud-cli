const chalk = require('chalk')

const update = ({ major, minor, latestMinor }) => {
  const version = `${major}.${minor}.0`
  let versionChalk
  let updateText

  if (latestMinor != null) {
    if (Number(latestMinor) > minor) {
      versionChalk = chalk.yellowBright
      updateText = `-> ${major}.${latestMinor}.0`
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
