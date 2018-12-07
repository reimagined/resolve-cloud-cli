const log = require('consola')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { CLOUD_CONFIG } = require('../constants')

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

const getAppPackage = async () => {
  try {
    const packageFile = await readFile(path.resolve('./package.json'), 'utf8')
    const { name, version } = JSON.parse(packageFile)
    if (!name || !version) {
      log.error(`package.json should contain name and version`)
    }
    return { name, version }
  } catch (e) {
    log.error(e)
  }
  return null
}

const getCloudConfig = async () => {
  const { RESOLVE_USERNAME, RESOLVE_REFRESH_TOKEN } = process.env
  if (RESOLVE_USERNAME && RESOLVE_REFRESH_TOKEN) {
    return {
      userName: RESOLVE_USERNAME,
      refreshToken: RESOLVE_REFRESH_TOKEN
    }
  }
  try {
    const resolveCloudConfig = await readFile(CLOUD_CONFIG.PATH, 'utf8')
    return JSON.parse(resolveCloudConfig)
  } catch (e) {
    log.error(e)
  }
  return {}
}

const updateCloudConfig = async config => {
  const currentConfig = await getCloudConfig()

  await writeFile(
    CLOUD_CONFIG.PATH,
    JSON.stringify(Object.assign(currentConfig, config), null, 2),
    'utf8'
  )
}

module.exports = {
  getCloudConfig,
  updateCloudConfig,
  getAppPackage
}
