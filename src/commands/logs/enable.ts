import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, 'log-level': logLevel, scope } = params

  await client.enableLogs({
    deploymentId,
    logLevel,
    scope,
  })

  logger.success(`Logs for application "${deploymentId}" successfully enabled`)
})

export const command = 'enable <deployment-id>'
export const describe = chalk.green('enable application logs')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .option('log-level', {
      alias: 'lvl',
      describe: 'available levels: [ log, error, warn, debug, info, verbose ]',
      type: 'string',
    })
    .option('scope', {
      alias: 's',
      describe: 'the scope for logs',
      type: 'string',
    })
    .group(['log-level', 'scope'], 'Options:')
