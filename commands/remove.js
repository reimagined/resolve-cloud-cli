const chalk = require('chalk')
const log = require('consola')
const refreshToken = require('../refreshToken')
const { del, get } = require('../api/client')
const { DEPLOYMENT_STATE_AWAIT_INTERVAL_MS } = require('../constants')

const waitForDeploymentState = async (token, id, expectedState) => {
  const { result: { state } } = await get(token, `deployments/${id}`)

  log.trace(`received deployment ${id} state: ${state}, expected state: ${expectedState}`)

  if (state === expectedState) {
    return state
  }

  await new Promise(resolve => setTimeout(resolve, DEPLOYMENT_STATE_AWAIT_INTERVAL_MS))
  return waitForDeploymentState(token, id, expectedState)
}

const handler = refreshToken(async (token, { deployment, noWait }) => {
  log.trace(`requesting deployment removal`)

  await del(token, `deployments/${deployment}`)

  if (!noWait) {
    log.trace(`waiting for deployment ready state`)
    await waitForDeploymentState(token, deployment, 'destroyed')
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
      .option('noWait', {
        describe: 'do not wait for the ready state',
        type: 'boolean',
        default: false
      })
}
