import chalk from 'chalk'

import { patch } from '../../api/client'
import { logger } from '../../utils/std'
import refreshToken from '../../refreshToken'

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': eventStoreId, 'deployment-id': deploymentId } = params
  await patch(token, `/event-stores/${eventStoreId}/link`, { deploymentId })

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
