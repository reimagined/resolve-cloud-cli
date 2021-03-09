import chalk from 'chalk'

import { del } from '../../api/client'
import refreshToken from '../../refreshToken'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, variables } = params

  return del(token, `deployments/${deploymentId}/environment`, { variables })
})

export const command = 'remove <deployment-id> <variables...>'
export const aliases = ['rm']
export const describe = chalk.green('remove environment variables')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .positional('variables', {
      describe: chalk.green('a list of environment variables names'),
      type: 'array',
    })
