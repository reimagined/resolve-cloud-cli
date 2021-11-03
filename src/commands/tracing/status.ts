import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId } = params

  const result = await client.getTracingStatus({ deploymentId })

  logger.info(`Performance tracing status: "${result}"`)
})

export const command = 'status <deployment-id>'
export const describe = chalk.green("retrieve an application's performance tracing status")
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
