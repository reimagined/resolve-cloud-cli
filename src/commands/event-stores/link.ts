import chalk from 'chalk'
import inquirer from 'inquirer'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { 'event-store-id': eventStoreId, 'deployment-id': deploymentId, force } = params

  const { eventStoreId: linkedEventStoreId } = await client.describeDeployment({
    deploymentId,
  })

  if (!force && linkedEventStoreId != null) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message:
          'This application is already linked to an event-store. Are you sure you want to switch the existing event-store with the specified one?',
      },
    ])

    if (!confirm) {
      return
    }
  }

  await client.linkDeployment({
    eventStoreId,
    deploymentId,
  })

  logger.success(`Link ${eventStoreId} to ${deploymentId} successfully completed!`)
})

export const command = 'link <event-store-id> <deployment-id>'
export const describe = chalk.green('link event store to deployment')
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
    .option('force', {
      describe: 'skip all prompts and run non-interactively',
      type: 'boolean',
      default: false,
    })
