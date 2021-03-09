import chalk from 'chalk'

import refreshToken from '../refreshToken'
import { del, patch } from '../api/client'
import { logger } from '../utils/std'
import { HEADER_EXECUTION_MODE } from '../constants'

const optionalWait = async (promise: Promise<any>, flag: boolean) => {
  if (flag) {
    await promise
  }
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, 'with-event-store': withEventStore, wait } = params

  logger.trace(`requesting deployment removal`)

  await patch(token, `/deployments/${deploymentId}/shutdown`, undefined, {
    [HEADER_EXECUTION_MODE]: 'async',
  })

  await optionalWait(
    del(
      token,
      `/deployments/${deploymentId}`,
      { withEventStore },
      { [HEADER_EXECUTION_MODE]: 'async' }
    ),
    wait
  )

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
