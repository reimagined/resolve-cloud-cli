const log = require('consola')
const chalk = require('chalk')
const { post, get } = require('../api/client')
const refreshToken = require('../refreshToken')
const config = require('../config')

const handler = refreshToken(async (token, { version }) => {
  const name = config.getPackageValue('name', '')

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw Error('incorrect application name (wrong working directory?)')
  }

  log.start(`upgrading application`)
  log.trace(`requesting the list of existing deployments`)

  const { result: deployments } = await get(token, 'deployments')

  log.trace(`deployment list received: ${deployments.length} items`)
  let id

  const nameDeployments = deployments.reduce(
    (acc, item) => (item.name === name ? acc.concat(item) : acc),
    []
  )

  if (nameDeployments.length > 1) {
    throw Error(`multiple deployments with the same name "${name}" found`)
  }

  if (nameDeployments.length > 0) {
    ;[{ id }] = nameDeployments
  }

  if (!id) {
    throw Error(`deployment is not found`)
  }

  log.trace(`deployment id obtained: ${id}`)

  await post(token, 'upgrade', {
    name,
    id,
    version
  })

  log.success(`application is upgraded`)
})

module.exports = {
  handler,
  command: 'upgrade',
  describe: chalk.green('upgrades deployed application'),
  builder: yargs =>
    yargs.option('version', {
      describe: 'version to upgrade',
      type: 'string',
      default: null
    })
}
