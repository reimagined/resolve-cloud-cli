import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { out, logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { 'event-store-id': eventStoreId } = params

  await client.clearEventStore({
    eventStoreId,
  })
  logger.success('Event-stores clear successfully completed!')

  out(
    'Run the "read-models reset-all" and "sagas reset-all" commands to reset read-models and sagas'
  )
})

export const command = 'clear <event-store-id>'
export const describe = chalk.green('clear an event-store')
export const builder = (yargs: any) =>
  yargs.positional('event-store-id', {
    describe: chalk.green("an existing event store's id"),
    type: 'string',
  })
