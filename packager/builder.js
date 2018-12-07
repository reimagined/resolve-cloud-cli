const path = require('path')
const { spawn } = require('child_process')

const yarn = /^win/.test(process.platform) ? 'yarn.cmd' : 'yarn'

const exec = async (cmd, args, options) =>
  new Promise((resolve, reject) => {
    const proc = spawn(
      cmd,
      args,
      Object.assign({
        stdio: 'inherit',
        ...options
      })
    )

    proc.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`process exit with code ${code}`))
      }
      return resolve()
    })
  })

module.exports = async (config, deploymentId) => {
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
