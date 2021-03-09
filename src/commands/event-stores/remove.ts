import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'
import { logger } from '../../utils/std'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': id } = params

  await del(token, `/event-stores/${id}`, undefined, { [HEADER_EXECUTION_MODE]: 'async' })

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
