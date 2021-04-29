import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'
import { logger } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId } = params

  await del(token, `deployments/${deploymentId}/logs`, {})

  logger.success(`Logs for application "${deploymentId}" successfully removed`)
})

export const command = 'remove <deployment-id>'
export const describe = chalk.green('remove application logs')
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
