import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { 'event-store-id': eventStoreId } = params

  await client.freezeEventStore({ eventStoreId })

  logger.success('Freeze event-store successfully completed!')
})

export const command = 'freeze <event-store-id>'
export const describe = chalk.green('freeze an event store on the cloud')
export const builder = (yargs: any) =>
  yargs.positional('event-store-id', {
    describe: chalk.green("an existing event store's id"),
    type: 'string',
  })
