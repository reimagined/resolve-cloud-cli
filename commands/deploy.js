const fs = require('fs')
const path = require('path')
const log = require('consola')
const chalk = require('chalk')
const qr = require('qrcode-terminal')
const FormData = require('form-data')
const { post, get, put } = require('../api/client')
const refreshToken = require('../refreshToken')
const packager = require('../packager')
const config = require('../config')
const { DEPLOYMENT_STATE_AWAIT_INTERVAL_MS } = require('../constants')

const upload = async (token, payload) =>
  post(token, 'upload', payload, {
    'Content-Type': `multipart/form-data; boundary=${payload.getBoundary()}`
  })

const waitForDeploymentState = async (token, id, expectedState) => {
  const {
    result: { state }
  } = await get(token, `deployments/${id}`)

  log.trace(`received the ${id} deployment's state: ${state}, expected state: ${expectedState}`)

  if (state === expectedState) {
    return state
  }

  await new Promise(resolve => setTimeout(resolve, DEPLOYMENT_STATE_AWAIT_INTERVAL_MS))
  return waitForDeploymentState(token, id, expectedState)
}

const handler = refreshToken(
  async (token, { skipBuild, noWait, configuration, name: nameOverride, deploymentId }) => {
    const name = nameOverride || config.getPackageValue('name', '')

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw Error('incorrect application name (wrong working directory?)')
    }

    log.start(`deploying the "${name}" application to the cloud`)
    log.trace(`requesting the list of existing deployments`)

    const { result: deployments } = await get(token, 'deployments')

    log.trace(`deployment list received: ${deployments.length} items`)

    let id

    if (deploymentId) {
      log.trace(`searching existing deployment with id "${deploymentId}"`)
      if (deployments.findIndex(item => item.id === deploymentId) >= 0) {
        id = deploymentId
      }
    } else {
      const nameDeployments = deployments.reduce(
        (acc, item) => (item.name === name ? acc.concat(item) : acc),
        []
      )
      if (nameDeployments.length > 1) {
        throw Error(`multiple deployments with the same name "${name} found"`)
      }
      if (nameDeployments.length > 0) {
        ;[{ id }] = nameDeployments
      }
    }

    if (!id) {
      if (deploymentId) {
        log.trace(`creating new deployment with id ${deploymentId}`)
      } else {
        log.trace(`creating a new deployment`)
      }

      const {
        result: { id: newId }
      } = await post(token, `deployments`, {
        name,
        id: deploymentId
      })
      id = newId
    }

    log.trace(`deployment id obtained: ${id}`)

    if (!skipBuild) {
      await packager(configuration, id)
    } else {
      log.trace(`skipping the application build phase`)
    }

    log.trace(`opening a code package stream`)
    const codeStream = new FormData({})
    codeStream.append('file', fs.createReadStream(path.resolve('code.zip')))

    log.trace(`opening a static package stream`)
    const staticStream = new FormData({})
    staticStream.append('file', fs.createReadStream(path.resolve('static.zip')))

    log.trace(`uploading packages to the endpoint`)
    const [
      {
        result: { id: codePackage }
      },
      {
        result: { id: staticPackage }
      }
    ] = await Promise.all([upload(token, codeStream), upload(token, staticStream)])

    log.trace(`code package [${codePackage}], static package [${staticPackage}]`)
    log.trace(`updating the deployment [${id}]`)

    const {
      result: { appUrl }
    } = await put(token, `deployments/${id}`, {
      name,
      codePackage,
      staticPackage
    })

    if (!noWait) {
      log.trace(`waiting for the deployment ready state`)
      await waitForDeploymentState(token, id, 'ready')
    } else {
      log.trace(`skip waiting for the deployment ready state`)
    }

    log.success(`"${name}" available at ${appUrl}`)

    qr.generate(appUrl, { small: true })
  }
)

module.exports = {
  handler,
  command: 'deploy',
  aliases: ['$0'],
  describe: chalk.green('deploy a reSolve application to the cloud to the cloud'),
  builder: yargs =>
    yargs
      .option('skipBuild', {
        describe: 'skip the application build phase',
        type: 'boolean',
        default: false
      })
      .option('configuration', {
        alias: 'c',
        describe: 'the name of the configuration to use',
        type: 'string',
        default: 'cloud'
      })
      .option('name', {
        alias: 'n',
        describe: 'the application name (the name from package.json is used by default)',
        type: 'string'
      })
      .option('deploymentId', {
        alias: 'd',
        describe: 'create or update the deployment with specific global ID',
        type: 'string'
      })
      .option('noWait', {
        describe: 'do not wait for the deployment to reach the ready state',
        type: 'boolean',
        default: false
      })
}
