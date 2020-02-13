const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const log = require('consola')
const chalk = require('chalk')
const nanoid = require('nanoid')
const isEmpty = require('lodash.isempty')
const qr = require('qrcode-terminal')
const FormData = require('form-data')
const { post, get, put } = require('../api/client')
const refreshToken = require('../refreshToken')
const packager = require('../packager')
const config = require('../config')

const { DEPLOYMENT_STATE_AWAIT_INTERVAL_MS, LATEST_RUNTIME_SPECIFIER } = require('../constants')

const upload = async (token, type, file) => {
  const key = nanoid()
  const {
    result: { url, headers = {}, fields = {} }
  } = await get(token, `upload/url?type=${type}&key=${key}`)

  const form = new FormData()
  Object.keys(fields).forEach(field => form.append(field, fields[field]))

  form.append('file', fs.createReadStream(path.resolve(file)))

  const contentLength = await new Promise((resolve, reject) =>
    form.getLength((err, length) => {
      if (err) {
        return reject(err)
      }
      return resolve(length)
    })
  )

  await post(null, url, form, {
    'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
    'Content-Length': contentLength,
    ...headers
  })

  return key
}

const waitForDeploymentStatus = async (token, id, expectedStates) => {
  const {
    result: { status, errors }
  } = await get(token, `deployments/${id}`)

  log.trace(
    `received the ${id} deployment's state: ${status}, expected states: ${expectedStates.join(',')}`
  )

  if (expectedStates.includes(status)) {
    return { status, errors }
  }

  await new Promise(resolve => setTimeout(resolve, DEPLOYMENT_STATE_AWAIT_INTERVAL_MS))
  return waitForDeploymentStatus(token, id, expectedStates)
}

const handler = refreshToken(
  async (
    token,
    {
      skipBuild,
      noWait,
      configuration,
      name: nameOverride,
      deploymentId,
      events,
      qr: generateQrCode,
      runtime,
      environment
    }
  ) => {
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
        id: deploymentId,
        runtime
      })
      id = newId
    } else if (!isEmpty(runtime) && runtime !== LATEST_RUNTIME_SPECIFIER) {
      throw Error(`cannot change runtime of the existing deployment`)
    }

    log.trace(`deployment id obtained: ${id}`)

    if (!skipBuild) {
      await packager(configuration, id)
    } else {
      log.trace(`skipping the application build phase`)
    }
    log.trace(`uploading deployment resources`)

    const [codePackage, staticPackage, initialEvents] = await Promise.all([
      upload(token, 'deployment', 'code.zip'),
      upload(token, 'deployment', 'static.zip'),
      isEmpty(events) ? Promise.resolve(null) : upload(token, 'events', events)
    ])

    log.trace(`code package [${codePackage}], static package [${staticPackage}]`)
    if (initialEvents) {
      log.trace(`initial events are uploaded as [${initialEvents}]`)
    }
    log.trace(`updating the deployment [${id}]`)

    const {
      result: { appUrl }
    } = await put(token, `deployments/${id}`, {
      name,
      codePackage,
      staticPackage,
      initialEvents,
      environment: !isEmpty(environment) ? dotenv.parse(Buffer.from(environment.join('\n'))) : null
    })

    if (!noWait) {
      log.trace(`waiting for the deployment ready state`)
      const { status, errors } = await waitForDeploymentStatus(token, id, [
        'ready',
        'error',
        'deploy-error',
        'inconsistent'
      ])
      if (status !== 'ready') {
        throw Error(`unexpected deployment state "${status}" with error: ${errors || 'none'}"`)
      }
    } else {
      log.trace(`skip waiting for the deployment ready state`)
    }

    log.success(`"${name}" available at ${appUrl}`)

    if (generateQrCode) {
      qr.generate(appUrl, { small: true })
    }
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
        describe: `${chalk.yellow(
          '(deprecated)'
        )} create or update the deployment with specific global ID`,
        type: 'string'
      })
      .option('noWait', {
        describe: 'do not wait for the deployment to reach the ready state',
        type: 'boolean',
        default: false
      })
      .option('events', {
        describe: 'initial events snapshot (new deployments only)',
        type: 'string'
      })
      .option('qr', {
        describe: 'generate QR code',
        type: 'boolean',
        default: false
      })
      .option('runtime', {
        describe: 'target runtime specifier',
        type: 'string',
        default: LATEST_RUNTIME_SPECIFIER
      })
      .option('environment', {
        describe: 'a list of key=value pairs describing environment variables',
        alias: 'env',
        type: 'array'
      })
}
