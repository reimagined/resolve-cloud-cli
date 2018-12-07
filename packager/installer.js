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

module.exports = async cloudEntry =>
  exec(yarn, [], {
    cwd: path.resolve(cloudEntry)
  })
