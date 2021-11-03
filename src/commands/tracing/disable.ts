import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId } = params

  await client.disableTracing({
    deploymentId,
  })

  logger.success('Performance tracing successfully disabled')
})

export const command = 'disable <deployment-id>'
export const describe = chalk.green('disable performance tracing')
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
