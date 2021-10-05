import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'
import { logger } from '../../utils/std'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': eventStoreId } = params

  await patch(token, `/event-stores/${eventStoreId}/unfreeze`, undefined, {
    [HEADER_EXECUTION_MODE]: 'async',
  })

  logger.success('Unfreeze event-store successfully completed!')
})

export const command = 'unfreeze <event-store-id>'
export const describe = chalk.green('unfreeze an event store on the cloud')
export const builder = (yargs: any) =>
  yargs.positional('event-store-id', {
    describe: chalk.green("an existing event store's id"),
    type: 'string',
  })
