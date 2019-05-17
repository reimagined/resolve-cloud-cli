const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const log = require('consola')
const { get } = require('../config')

const readdir = promisify(fs.readdir)
const lstat = promisify(fs.lstat)
const readFile = promisify(fs.readFile)

const collectWorkspacePackages = async (root, packages) => {
  const checkCandidate = async candidate => {
    try {
      const packageJson = JSON.parse(await readFile(path.resolve(candidate.path, 'package.json')))
      return {
        ...candidate,
        name: packageJson.name,
        valid: true
      }
    } catch (e) {
      log.warn(`suspicious package located at ${candidate.path}`)
      return { ...candidate, valid: false }
    }
  }

  const onionTest = /^(.*)\*$/i.exec(root)

  if (onionTest) {
    const actualRoot = onionTest[1]
    return readdir(actualRoot)
      .then(entries =>
        Promise.all(
          entries.map(async entry => {
            const directory = path.resolve(actualRoot, entry)
            const stats = await lstat(directory)
            return {
              path: directory,
              isDirectory: stats.isDirectory()
            }
          })
        )
      )
      .then(entries => entries.filter(entry => entry.isDirectory))
      .then(candidates => Promise.all(candidates.map(checkCandidate)))
      .then(candidates => candidates.filter(candidate => candidate.valid))
      .then(subPackages =>
        subPackages.reduce((map, item) => {
          map[item.name] = item.path
          return map
        }, {})
      )
  }
  const candidate = await checkCandidate({
    path: root
  })
  if (candidate.valid) {
    return {
      [candidate.name]: candidate.path
    }
  }

  return packages
}

const collectPackages = async root => {
  try {
    const frameworkJson = JSON.parse(fs.readFileSync(path.resolve(root, 'package.json')).toString())
    const allowedLocations = frameworkJson.workspaces.packages.filter(location =>
      location.startsWith('packages/')
    )

    return Promise.all(
      allowedLocations.map(location => collectWorkspacePackages(path.resolve(root, location)))
    ).then(result => result.reduce((map, entry) => Object.assign(map, entry), {}))
  } catch (e) {
    log.error(e.message)
    return {}
  }
}

const copyPackages = async (cloudEntry, frameworkPackages) => {
  try {
    const dependencies = await readdir(path.resolve(cloudEntry, 'node_modules')).then(entries =>
      entries.filter(entry => Object.prototype.hasOwnProperty.call(frameworkPackages, entry))
    )

    await Promise.all(
      dependencies.map(async name => {
        const targetDirectory = path.resolve(cloudEntry, 'node_modules', name)
        log.trace(`[experimental] linking package ${name} -> ${targetDirectory}`)
        await fse.emptyDir(targetDirectory)
        await fse.copy(frameworkPackages[name], targetDirectory, {
          overwrite: true,
          dereference: true
        })
      })
    )
    return 0
  } catch (e) {
    log.error(e)
    return 1
  }
}

module.exports = async cloudEntry => {
  const resolveSymlink = get('symlinks.resolve')
  const linkedProjects = get('linked_projects') || []
  const projectDirectory = path.resolve()

  if (resolveSymlink && linkedProjects.find(directory => directory === projectDirectory)) {
    log.trace('[experimental] injecting linked framework to target node_modules')
    return copyPackages(cloudEntry, await collectPackages(resolveSymlink))
  }
  return 0
}
