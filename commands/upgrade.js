const log = require('consola')
const chalk = require('chalk')
const { post } = require('../api/client')
const refreshToken = require('../refreshToken')

const handler = refreshToken(async (token, { deployment, upgradeVersion }) => {
  log.start(`start application upgrading`)

  await post(token, `deployments/${deployment}/upgrade`, {
    version: upgradeVersion
  })

  log.success(`application is upgraded`)
})

module.exports = {
  handler,
  command: 'upgrade <deployment> <upgradeVersion>',
  describe: chalk.green('upgrades deployed application')
}
