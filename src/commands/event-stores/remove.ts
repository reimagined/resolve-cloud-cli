import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { 'event-store-id': eventStoreId } = params

  await client.dropEventStore({
    eventStoreId,
  })

  logger.success(`Event store has been removed`)
})

export const command = 'remove <event-store-id>'
export const aliases = ['drop', 'delete', 'rm']
export const describe = chalk.green('remove an event store')
export const builder = (yargs: any) =>
  yargs.positional('event-store-id', {
    describe: chalk.green("an existing event store's id"),
    type: 'string',
  })
