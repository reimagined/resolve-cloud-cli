#!/usr/bin/env node
import { build } from './yarn'
import zip from './zip'
import symlink from './symlinks'
import { logger } from '../utils/std'

export const codeZipPath = `code.zip`
export const staticZipPath = `static.zip`

const main = async (configuration: string | undefined, applicationName: string) => {
  logger.start(`building the "${applicationName}" application for deploying to the cloud`)
  const { serverPath, clientPath } = await build(configuration)

  logger.trace('installing cloud dependencies...')
  await symlink(serverPath)

  logger.trace('zipping...')
  await Promise.all([zip(serverPath, codeZipPath), zip(clientPath, staticZipPath)])

  logger.success('Resolve app built')
}

export default main
