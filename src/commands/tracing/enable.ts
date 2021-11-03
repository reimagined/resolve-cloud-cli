import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId } = params

  await client.enableTracing({
    deploymentId,
  })

  logger.success('Performance tracing successfully enabled')
})

export const command = 'enable <deployment-id>'
export const describe = chalk.green('enable performance tracing')
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
