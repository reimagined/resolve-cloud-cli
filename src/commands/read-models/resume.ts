import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, readmodel } = params

  return await patch(token, `deployments/${deploymentId}/read-models/${readmodel}/resume`, {})
})

export const command = 'resume <deployment-id> <readmodel>'
export const describe = chalk.green('resume read model updates')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .positional('readmodel', {
      describe: chalk.green("an existing read model's name"),
      type: 'string',
    })
