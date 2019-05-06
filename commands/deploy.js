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
  const { result: { state } } = await get(token, `deployments/${id}`)

  if (state === expectedState) {
    return state
  }

  await new Promise(resolve => setTimeout(resolve, DEPLOYMENT_STATE_AWAIT_INTERVAL_MS))
  return waitForDeploymentState(token, id, state)
}

const handler = refreshToken(
  async (token, { skipBuild, noWait, configuration, name: nameOverride, deploymentId }) => {
    const name = nameOverride || config.getPackageValue('name', '')

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw Error('incorrect application name (wrong working directory?)')
    }

    log.start(`deploying application "${name}" to the cloud`)
    log.trace(`requesting list of existing deployments`)

    const { result: deployments } = await get(token, 'deployments')

    log.trace(`deployment list arrived: ${deployments.length} items`)

    let id

    if (deploymentId) {
      if (deployments.findIndex(item => item.id === deploymentId)) {
        throw Error(`deployment "${deploymentId}" not found`)
      }
      id = deploymentId
    } else {
      const nameDeployments = deployments.reduce(
        (acc, item) => (item.name === name ? acc.concat(item) : acc),
        []
      )
      if (nameDeployments.length > 1) {
        throw Error(`multiple deployments with same name "${name} found"`)
      }
      if (nameDeployments.length > 0) {
        ;[{ id }] = nameDeployments
      }
    }

    if (!id) {
      log.trace(`deployment with name "${name}" not found`)
      log.trace(`creating new deployment`)

      const { result: { id: newId } } = await post(token, `deployments`, {
        name
      })
      id = newId
    }

    log.trace(`deployment id obtained: ${id}`)

    if (!skipBuild) {
      await packager(configuration, id)
    } else {
      log.trace(`skipping application building`)
    }

    log.trace(`opening code package stream`)
    const codeStream = new FormData({})
    codeStream.append('file', fs.createReadStream(path.resolve('code.zip')))

    log.trace(`opening static package stream`)
    const staticStream = new FormData({})
    staticStream.append('file', fs.createReadStream(path.resolve('static.zip')))

    log.trace(`uploading packages to endpoint`)
    const [{ result: { id: codePackage } }, { result: { id: staticPackage } }] = await Promise.all([
      upload(token, codeStream),
      upload(token, staticStream)
    ])

    log.trace(`code package [${codePackage}], static package [${staticPackage}]`)
    log.trace(`updating deployment [${id}]`)

    const { result: { appUrl } } = await put(token, `deployments/${id}`, {
      name,
      codePackage,
      staticPackage
    })

    if (!noWait) {
      log.trace(`waiting for deployment ready state`)
      await waitForDeploymentState(token, id, 'ready')
    } else {
      log.trace(`skip awaiting for deployment ready state`)
    }

    log.success(`"${name}" available at ${appUrl}`)

    qr.generate(appUrl, { small: true })
  }
)

module.exports = {
  handler,
  command: 'deploy',
  aliases: ['$0'],
  describe: chalk.green('deploy reSolve framework application to the cloud'),
  builder: yargs =>
    yargs
      .option('skip-build', {
        describe: 'skip application building',
        type: 'boolean',
        default: false
      })
      .option('configuration', {
        alias: 'c',
        describe: 'configuration name',
        type: 'string',
        default: 'cloud'
      })
      .option('name', {
        alias: 'n',
        describe: 'application name (name within package.json by default)',
        type: 'string'
      })
      .option('deployment-id', {
        alias: 'd',
        describe: 'update existing deployment by id',
        type: 'string'
      })
      .option('no-wait', {
        describe: 'do not wait for deployment ready state',
        type: 'boolean',
        default: false
      })
}
