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
    if (semver.major(runtime) !== semver.major(result.version)) {
      throw new Error('Application must be upgrade only by the same major version')
    }

    if (semver.minor(runtime) > semver.minor(result.latestVersion)) {
      throw new Error(
        `Version ${runtime} is not found: ${result.latestVersion} is the latest version`
      )
    }
  }

  await post(token, `deployments/${deployment}/upgrade/${runtime}`)
})

module.exports = {
  handler,
  command: 'upgrade <deployment>',
  describe: chalk.green(
    'upgrades deployed application to new minor version in the same major version'
  ),
  builder: yargs =>
    yargs.option('runtime', {
      describe: 'minor application version to which application is going to be upgraded',
      type: 'string',
      default: 'latest'
    })
}
