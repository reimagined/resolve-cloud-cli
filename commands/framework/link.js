const path = require('path')
const fs = require('fs')
const log = require('consola')
const chalk = require('chalk')
const { set, get } = require('../../config')

const handler = async () => {
  const currentDirectory = path.resolve()

  let packageJson
  try {
    log.trace('[experimental] reading package.json')
    packageJson = JSON.parse(
      fs.readFileSync(path.resolve(currentDirectory, 'package.json')).toString()
    )
  } catch (e) {
    log.error(e.message)
    return 1
  }

  if (packageJson.name === 'resolve') {
    log.trace('[experimental] reSolve framework detected, linking')

    set('symlinks.resolve', currentDirectory)

    log.trace(
      `[experimental]: symlink to (${packageJson.name}) framework v${packageJson.version} created successfully`
    )
  } else {
    const resolveSymlink = get('symlinks.resolve')

    if (!resolveSymlink) {
      log.error(`[experimental] no framework symlinks found`)
      return 1
    }

    const linkedProjects = get('linked_projects') || []
    if (!linkedProjects.find(directory => directory === currentDirectory)) {
      set('linked_projects', [...linkedProjects, currentDirectory])
      log.info(`[experimental] frameworks links added to the project`)
    } else {
      log.info(`[experimental] frameworks links already added to the project`)
    }
  }
  return 0
}

module.exports = {
  handler,
  command: 'link',
  describe: chalk.red('[experimental] link local reSolve framework')
}
