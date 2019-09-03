const path = require('path')
const log = require('consola')
const isEmpty = require('lodash.isempty')
const { spawn } = require('child_process')

const yarn = /^win/.test(process.platform) ? 'yarn.cmd' : 'yarn'
const notEmpty = val => !isEmpty(val)

const exec = async (cmd, args, options) =>
  new Promise((resolve, reject) => {
    const proc = spawn(
      cmd,
      args,
      Object.assign({
        stdio: 'pipe',
        ...options
      })
    )

    proc.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`process exit with code ${code}`))
      }
      return resolve()
    })
    proc.stdout.on('data', data =>
      data
        .toString()
        .split('\n')
        .filter(notEmpty)
        .map(m => log.trace(m))
    )
    proc.stderr.on('data', data =>
      data
        .toString()
        .split('\n')
        .filter(notEmpty)
        .map(m => log.error(m))
    )
  })

const build = async (config, deploymentId) => {
  await exec(yarn, [config], {
    env: Object.assign({}, process.env, {
      CLOUD_STATIC_URL: `https://static.resolve.sh/${deploymentId}`
    })
  })

  return {
    serverPath: path.resolve('dist/common/cloud-entry'),
    clientPath: path.resolve('dist/client')
  }
}

module.exports = {
  build
}
