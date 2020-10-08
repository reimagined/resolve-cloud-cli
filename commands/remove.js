const chalk = require('chalk')
const log = require('consola')
const refreshToken = require('../refreshToken')
const { del, get } = require('../api/client')
const { DEPLOYMENT_STATE_AWAIT_INTERVAL_MS } = require('../constants')

const waitForDeploymentStatus = async (token, id, expectedStatuses) => {
  const {
    result: { status, error }
  } = await get(token, `deployments/${id}`)

  log.trace(
    `received the ${id} deployment's status: ${status}, expected statues: ${expectedStatuses.join(
      ','
    )}`
  )

  if (expectedStatuses.includes(status)) {
    return { status, error }
  }

  await new Promise(resolve => setTimeout(resolve, DEPLOYMENT_STATE_AWAIT_INTERVAL_MS))
  return waitForDeploymentStatus(token, id, expectedStatuses)
}

const handler = refreshToken(async (token, { deployment, wait }) => {
  log.trace(`requesting deployment removal`)

  await del(token, `deployments/${deployment}`)

  if (wait) {
    log.trace(`waiting for deployment ready state`)
    const { status, error } = await waitForDeploymentStatus(token, deployment, [
      'destroyed',
      'error',
      'deploy-error',
      'inconsistent'
    ])

    if (status !== 'destroyed') {
      throw new Error(
        `unexpected deployment status "${status}" with error: "${error ||
          'no or an unknown error'}"`
      )
    }
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
      .option('wait', {
        describe: 'wait for the ready state',
        type: 'boolean',
        default: true
      })
}
