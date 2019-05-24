const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const log = require('consola')
const { get, del, set } = require('../../config')

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
    log.trace('[experimental] reSolve framework detected, unlinking')

    del('symlinks.resolve', 'linked_projects')

    log.trace(
      `[experimental] symlink to (${packageJson.name}) framework v${packageJson.version} removed`
    )
  } else {
    const linkedProjects = get('linked_projects') || []
    if (linkedProjects.find(directory => directory === currentDirectory)) {
      set('linked_projects', linkedProjects.filter(directory => directory !== currentDirectory))
      log.info(`[experimental] frameworks links removed`)
    } else {
      log.info(`[experimental] no frameworks links found`)
    }
  }
  return 0
}

module.exports = {
  handler,
  command: 'unlink',
  describe: chalk.red('[experimental] unlink local reSolve framework')
}
