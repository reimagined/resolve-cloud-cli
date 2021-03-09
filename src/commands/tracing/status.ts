import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { logger } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId } = params

  const { result } = await get(token, `deployments/${deploymentId}/tracing/status`)

  logger.info(`Performance tracing status: "${result}"`)
})

export const command = 'status <deployment-id>'
export const describe = chalk.green("retrieve an application's performance tracing status")
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
