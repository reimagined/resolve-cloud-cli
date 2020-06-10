const chalk = require('chalk')
const semver = require('semver')
const { post, get } = require('../api/client')
const refreshToken = require('../refreshToken')

const handler = refreshToken(async (token, { deployment, runtime }) => {
  const { result } = await get(token, `deployments/${deployment}`)

  if (!result) {
    throw new Error('Deployment not found')
  }

  if (runtime !== 'latest') {
    if (semver.major(runtime) !== result.major) {
      throw new Error('Application must be upgrade within currently used major version')
    }

    if (semver.minor(runtime) > Number(result.latestMinor)) {
      throw new Error(
        `Version ${runtime} is not found: ${result.latestMinor} is the latest minor version within the currently used major version`
      )
    }
  }

  await post(token, `deployments/${deployment}/upgrade/${runtime}`)
})

module.exports = {
  handler,
  command: 'upgrade <deployment>',
  describe: chalk.green(
    'upgrades a deployed application to the latest minor version of the reSolve cloud runtime within the currently used major version'
  ),
  builder: yargs =>
    yargs.option('runtime', {
      describe: "the cloud runtime's minor version within the currently used major version",
      type: 'string',
      default: 'latest'
    })
}
