import chalk from 'chalk'

import { logger } from '../utils/std'
import commandHandler from '../command-handler'

const optionalWait = async (promise: Promise<any>, flag: boolean) => {
  if (flag) {
    await promise
  }
}

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, 'with-event-store': withEventStore, wait } = params

  logger.trace(`requesting deployment removal`)

  let timer: any = null
  try {
    await Promise.race([
      client.shutdownDeployment({
        deploymentId,
      }),
      new Promise((resolve) => {
        timer = setTimeout(resolve, 60000)
      }),
    ])
  } catch (error) {
    if (
      !/Options "dbClusterOrInstanceArn" and "awsSecretStoreArn" are mandatory/.test(error.message)
    ) {
      logger.warn(`Shutdown deployment failed with "${error.message}"`)
    }
  }

  await optionalWait(
    client.dropDeployment({
      deploymentId,
      withEventStore,
    }),
    wait
  )

  clearTimeout(timer)

  if (wait) {
    logger.success(`Deployment "${deploymentId}" successfully removed`)
  } else {
    logger.success(`Deployment "${deploymentId}" has been scheduled for removal`)
  }
})

export const command = 'remove <deployment-id>'
export const aliases = ['rm']
export const describe = chalk.green('remove an application deployment with all its data')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .option('with-event-store', {
      describe: 'remove the linked event-store',
      type: 'boolean',
      default: false,
    })
    .option('wait', {
      describe: 'wait until the remove operation is complete',
      type: 'boolean',
      default: true,
    })
    .group(['with-event-store', 'wait'], 'Options:')
