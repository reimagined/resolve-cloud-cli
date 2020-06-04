const chalk = require('chalk')
const log = require('consola')
const refreshToken = require('../refreshToken')
const { del, get } = require('../api/client')
const { DEPLOYMENT_STATE_AWAIT_INTERVAL_MS } = require('../constants')

const waitForDeploymentStatus = async (token, id, expectedStatus) => {
  const {
    result: { status }
  } = await get(token, `deployments/${id}`)

  log.trace(`received deployment ${id} status: ${status}, expected status: ${expectedStatus}`)

  if (status === expectedStatus) {
    return status
  }

  await new Promise(resolve => setTimeout(resolve, DEPLOYMENT_STATE_AWAIT_INTERVAL_MS))
  return waitForDeploymentStatus(token, id, expectedStatus)
}

const handler = refreshToken(async (token, { deployment, 'no-wait': noWait }) => {
  log.trace(`requesting deployment removal`)

  await del(token, `deployments/${deployment}`)

  if (!noWait) {
    log.trace(`waiting for deployment ready state`)
    await waitForDeploymentStatus(token, deployment, 'destroyed')
  } else {
    log.trace(`skip waiting for deployment ready state`)
  }
})

module.exports = {
  handler,
  command: 'remove <deployment>',
  aliases: ['rm'],
  describe: chalk.green('remove an application deployment with all its data'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .option('no-wait', {
        describe: 'do not wait for the ready state',
        type: 'boolean',
        default: false
      })
}
