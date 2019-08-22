#!/usr/bin/env node
const log = require('consola')

const { build } = require('./yarn')
const zip = require('./zip')
const symlink = require('./symlinks')

module.exports = async (config, deploymentId) => {
  log.trace('building application...')
  const { serverPath, clientPath } = await build(config, deploymentId)

  log.trace('installing cloud dependencies...')
  await symlink(serverPath)

  log.trace('zipping...')
  await Promise.all([zip(serverPath, 'code'), zip(clientPath, 'static')])

  log.trace('Resolve app built')
}
