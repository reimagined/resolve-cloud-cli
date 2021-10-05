import chalk from 'chalk'

import { patch } from '../../api/client'
import { out, logger } from '../../utils/std'
import refreshToken from '../../refreshToken'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': eventStoreId } = params

  await patch(token, `/event-stores/${eventStoreId}/clear`, undefined, {
    [HEADER_EXECUTION_MODE]: 'async',
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
