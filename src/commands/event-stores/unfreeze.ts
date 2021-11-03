import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { 'event-store-id': eventStoreId } = params

  await client.unfreezeEventStore({ eventStoreId })

  logger.success('Unfreeze event-store successfully completed!')
})

export const command = 'unfreeze <event-store-id>'
export const describe = chalk.green('unfreeze an event store on the cloud')
export const builder = (yargs: any) =>
  yargs.positional('event-store-id', {
    describe: chalk.green("an existing event store's id"),
    type: 'string',
  })
