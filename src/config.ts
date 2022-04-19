import os from 'os'
import fs from 'fs'
import path from 'path'
import rc from 'rc'
import * as semver from 'semver'

import * as configHelpers from './utils/config-helpers'

const configFile = path.join(os.homedir(), '.resolverc')

const load = () => {
  const conf = rc('resolve')
  return Object.entries(conf).reduce((obj: Record<string, any>, [key, value]) => {
    obj[key.toLowerCase()] = value
    return obj
  }, {})
}

const loadFile = () => {
  try {
    return JSON.parse(fs.readFileSync(configFile, 'utf8'))
  } catch (e) {
    return {}
  }
}

const saveFile = (conf: any) => {
  fs.writeFileSync(configFile, JSON.stringify(conf, null, 2), 'utf8')
}

export const get = (...selectors: Array<string>) => {
  const conf = load()
  return selectors
    .map((selector) => configHelpers.get(conf, selector))
    .reduce((acc, value) => {
      if (acc === null) {
        return value
      }
      return [].concat(acc, value)
    }, null)
}

export const set = (selector: string, value: any) => {
  const conf = loadFile()
  configHelpers.set(conf, selector, value)
  saveFile(conf)
}

export const del = (...selectors: Array<string>) => {
  const conf = loadFile()
  selectors.map((selector) => configHelpers.unset(conf, selector))
  saveFile(conf)
}

export const getResolvePackageVersion = (): string => {
  let pkg: any = null
  try {
    pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  } catch (error) {
    throw new Error('Failed to read "package.json" file.')
  }

  const keys = Object.keys(pkg.dependencies)
  const resolvePackageNames = keys.filter(
    (name) =>
      ((name.startsWith('resolve') &&
        name !== 'resolve-cloud' &&
        name !== 'resolve-cloud-common') ||
        name.startsWith('@reimagined/') ||
        name.startsWith('@resolve-js/')) &&
      pkg.dependencies[name] != null &&
      !pkg.dependencies[name].startsWith('file:')
  )
  const packageName = resolvePackageNames[0]
  if (packageName == null) {
    throw new Error('The resolve packages were not found')
  }

  const version = pkg.dependencies[packageName]

  // eslint-disable-next-line no-restricted-syntax
  for (const name of resolvePackageNames) {
    const packageVersion = pkg.dependencies[name]
    const firstVersion = semver.valid(semver.coerce(packageVersion))
    const secondVersion = semver.valid(semver.coerce(version))
    if (firstVersion == null || secondVersion == null || semver.neq(firstVersion, secondVersion)) {
      throw new Error(
        `The resolve package versions must be the same [${resolvePackageNames
          .map((item) => `"${item}"`)
          .join(', ')}]`
      )
    }
  }

  if (version != null && version.constructor === String) {
    return version as string
  } else {
    throw new Error('Failed to get resolve package version')
  }
}

export const getApplicationIdentifier = (nameOverride?: string): string => {
  let pkg = null
  try {
    pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  } catch (error) {
    throw new Error('Failed to read "package.json" file.')
  }

  const name: string = nameOverride != null ? nameOverride : pkg.name

  if (name == null || name.constructor !== String || `${name}`.trim().length < 1) {
    throw new Error('incorrect application name (wrong working directory?)')
  }

  return name
}
