#!/usr/bin/env node
const log = require('consola')

const build = require('./builder')
const zip = require('./zip')
const install = require('./installer')

module.exports = async (config, deploymentId) => {
  log.start('Building resolve application...')
  const { serverPath, clientPath } = await build(config, deploymentId)

  log.debug('Installing cloud dependencies...')
  await install(serverPath)

  log.debug('Making zip...')
  await Promise.all([zip(serverPath, 'code'), zip(clientPath, 'static')])

  log.success('Resolve app built')
}
