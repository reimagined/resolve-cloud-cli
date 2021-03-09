import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'

import { get } from '../config'
import { logger } from '../utils/std'

const readdir = promisify(fs.readdir)
const lstat = promisify(fs.lstat)
const readFile = promisify(fs.readFile)

const collectWorkspacePackages = async (root: any) => {
  const checkCandidate = async (candidate: any) => {
    try {
      const packageJson = JSON.parse(
        (await readFile(path.resolve(candidate.path, 'package.json'))).toString()
      )
      return {
        ...candidate,
        name: packageJson.name,
        valid: true,
      }
    } catch (e) {
      logger.warn(`suspicious package located at ${candidate.path}`)
      return { ...candidate, valid: false }
    }
  }

  const onionTest = /^(.*)\*$/i.exec(root)

  if (onionTest) {
    const actualRoot = onionTest[1]
    if (actualRoot == null) {
      return {}
    }
    return readdir(actualRoot)
      .then((entries) =>
        Promise.all(
          entries.map(async (entry) => {
            const directory = path.resolve(actualRoot, entry)
            const stats = await lstat(directory)
            return {
              path: directory,
              isDirectory: stats.isDirectory(),
            }
          })
        )
      )
      .then((entries) => entries.filter((entry) => entry.isDirectory))
      .then((candidates) => Promise.all(candidates.map(checkCandidate)))
      .then((candidates) => candidates.filter((candidate) => candidate.valid))
      .then((subPackages) =>
        subPackages.reduce((map, item) => {
          map[item.name] = item.path
          return map
        }, {})
      )
  }
  const candidate = await checkCandidate({
    path: root,
  })
  if (candidate.valid) {
    return {
      [candidate.name]: candidate.path,
    }
  }
}

const collectPackages = async (root: any) => {
  try {
    const frameworkJson = JSON.parse(fs.readFileSync(path.resolve(root, 'package.json')).toString())
    const allowedLocations = frameworkJson.workspaces.packages.filter((location: any) =>
      location.startsWith('packages/')
    )

    return Promise.all(
      allowedLocations.map((location: any) =>
        collectWorkspacePackages(path.resolve(root, location))
      )
    ).then((result) => result.reduce((map, entry) => Object.assign(map, entry), {}))
  } catch (e) {
    logger.error(e.message)
    return {}
  }
}

const copyPackages = async (cloudEntry: any, frameworkPackages: any) => {
  try {
    const dependencies = await readdir(path.resolve(cloudEntry, 'node_modules')).then((entries) =>
      entries.filter((entry) => Object.prototype.hasOwnProperty.call(frameworkPackages, entry))
    )

    await Promise.all(
      dependencies.map(async (name) => {
        const targetDirectory = path.resolve(cloudEntry, 'node_modules', name)
        logger.trace(`[experimental] linking package ${name} -> ${targetDirectory}`)
        await fse.emptyDir(targetDirectory)
        await fse.copy(frameworkPackages[name], targetDirectory, {
          overwrite: true,
          dereference: true,
        })
      })
    )
    return 0
  } catch (e) {
    logger.error(e)
    return 1
  }
}

export default async (cloudEntry: any) => {
  const resolveSymlink = get('symlinks.resolve')
  const linkedProjects = get('linked_projects') || []
  const projectDirectory = path.resolve()

  if (resolveSymlink && linkedProjects.find((directory: any) => directory === projectDirectory)) {
    logger.trace('[experimental] injecting linked framework to target node_modules')
    return copyPackages(cloudEntry, await collectPackages(resolveSymlink))
  }
  return 0
}
