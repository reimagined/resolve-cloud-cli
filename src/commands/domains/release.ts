import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId } = params

  return del(token, `/deployments/${deploymentId}/domain`, {})
})

export const command = 'release <deployment-id>'
export const aliases = ['unbind']
export const describe = chalk.green('unbind domain for existing deployment')
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
