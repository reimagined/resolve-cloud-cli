import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'
import { logger } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId } = params

  await patch(token, `deployments/${deploymentId}/logs/disable`, {})

  logger.success(`Logs for application "${deploymentId}" successfully disabled`)
})

export const command = 'disable <deployment-id>'
export const describe = chalk.green('disable logging in application')
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
