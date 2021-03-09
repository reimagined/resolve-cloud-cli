import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const yarn = /^win/.test(process.platform) ? 'yarn.cmd' : 'yarn'

export const build = async (configuration: string | undefined) => {
  let script = `${yarn} `
  if (configuration != null) {
    script += configuration
  }

  await execSync(script, {
    env: process.env,
    stdio: 'inherit',
  })

  const serverPath = path.resolve('dist/common/cloud-entry')

  const pkgPath = path.join(serverPath, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath).toString('utf8'))
  pkg.dependencies['aws-xray-sdk-core'] = '^3.2.0'
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

  return {
    serverPath,
    clientPath: path.resolve('dist/client'),
  }
}
