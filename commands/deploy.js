// TODO: route all api
// TODO: tests
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

const upload = async (token, payload) =>
  post(token, 'upload', payload, {
    'Content-Type': `multipart/form-data; boundary=${payload.getBoundary()}`
  })

const waitForDeploymentState = async (id, expectedState) => {
  const { state } = await get(`deployments/${id}`)

  if (state === expectedState) {
    return state
  }

  await new Promise(resolve => setTimeout(resolve, 5000))
  return waitForDeploymentState(id, state)
}

const handler = refreshToken(
  async (token, { skipBuild, noWait, configuration, name: nameOverride }) => {
    const name = nameOverride || config.getPackageValue('name', '')

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw Error('incorrect application name (wrong working directory?)')
    }

    log.start(`deploying application "${name}" to the cloud`)
    log.trace(`requesting list of existing deployments`)

    const { result: deployments } = await get(token, 'deployments')

    log.trace(`deployment list arrived: ${deployments.length} items`)

    let { id } = deployments.find(item => item.name === name) || {}

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
    const [{ id: codePackage }, { id: staticPackage }] = await Promise.all([
      upload(token, codeStream),
      upload(token, staticStream)
    ])

    log.trace(`code package [${codePackage}], static package [${staticPackage}]`)
    log.trace(`updating deployment [${id}]`)

    const { result: { url } } = await put(token, `deployments/${id}`, {
      name,
      codePackage,
      staticPackage
    })

    if (!noWait) {
      log.trace(`waiting for deployment ready state`)
      await waitForDeploymentState(id, 'ready')
    } else {
      log.trace(`skip awaiting for deployment ready state`)
    }

    log.success(`application "${name}" successfully deployed`)

    qr.generate(url, { small: true })
  }
)

module.exports = {
  handler,
  command: 'deploy',
  aliases: ['$0'],
  describe: chalk.green('deploy reSolve framework application to the cloud'),
  builder: yargs =>
    yargs
      .option('skipBuild', {
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
      .option('noWait', {
        describe: 'do not wait for deployment ready state',
        type: 'boolean',
        default: 'false'
      })
}
