const os = require('os')
const fs = require('fs')
const rc = require('rc')
const path = require('path')
const semver = require('semver')
const lodashGet = require('lodash.get')
const lodashSet = require('lodash.set')
const lodashUnset = require('lodash.unset')

const configFile = path.join(os.homedir(), '.resolverc')

const load = () => {
  const conf = rc('resolve', {
    api_url: 'https://api.resolve.sh',
    auth: {
      client_id: '3hsjmqkeoajn6pg29nniugivcl',
      user_pool_id: 'eu-west-1_mUugUIqHh'
    }
  })
  return Object.entries(conf).reduce((obj, [key, value]) => {
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

const saveFile = conf => {
  fs.writeFileSync(configFile, JSON.stringify(conf, null, 2), 'utf8')
}

const get = (...selectors) => {
  const conf = load()
  return selectors
    .map(selector => lodashGet(conf, selector))
    .reduce((acc, value) => {
      if (acc === null) {
        return value
      }
      return [].concat(acc, value)
    }, null)
}

const set = (selector, value) => {
  const conf = loadFile()
  lodashSet(conf, selector, value)
  saveFile(conf)
}

const del = (...selectors) => {
  const conf = loadFile()
  selectors.map(selector => lodashUnset(conf, selector))
  saveFile(conf)
}

const getPackageValue = (selector, defaultValue = undefined) => {
  let pkg = {}
  try {
    pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  } catch (e) {
    return defaultValue
  }

  return lodashGet(pkg, selector, defaultValue)
}

const getResolvePackageVersion = () => {
  let pkg = null
  try {
    pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  } catch (error) {
    throw new Error('Failed to read "package.json" file.')
  }

  const keys = Object.keys(pkg.dependencies)
  const resolvePackageNames = keys.filter(
    name => name.startsWith('resolve') && name !== 'resolve-cloud'
  )
  const version = pkg.dependencies[resolvePackageNames[0]]

  // eslint-disable-next-line no-restricted-syntax
  for (const name of resolvePackageNames) {
    if (
      semver.neq(
        semver.valid(semver.coerce(pkg.dependencies[name])),
        semver.valid(semver.coerce(version))
      )
    ) {
      throw new Error('The resolve package versions must be the same.')
    }
  }
  return version
}

module.exports = {
  get,
  set,
  del,
  getPackageValue,
  getResolvePackageVersion
}
