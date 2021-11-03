import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { 'event-store-id': eventStoreId, 'deployment-id': deploymentId } = params

  await client.unlinkDeployment({
    eventStoreId,
    deploymentId,
  })

  logger.success(`Unlink ${eventStoreId} to ${deploymentId} successfully completed!`)
})

export const command = 'unlink <event-store-id> <deployment-id>'
export const describe = chalk.green('unlink event store from deployment')
export const builder = (yargs: any) =>
  yargs
    .positional('event-store-id', {
      describe: chalk.green("an existing event store's id"),
      type: 'string',
    })
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
