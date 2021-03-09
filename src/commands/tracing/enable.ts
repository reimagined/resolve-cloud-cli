import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'
import { logger } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId } = params

  await patch(token, `deployments/${deploymentId}/tracing/enable`, {})

  logger.success('Performance tracing successfully enabled')
})

export const command = 'enable <deployment-id>'
export const describe = chalk.green('enable performance tracing')
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
