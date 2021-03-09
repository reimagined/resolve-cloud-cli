import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id } = params
  return del(token, `domains/${id}`, undefined, { [HEADER_EXECUTION_MODE]: 'async' })
})

export const command = 'remove <id>'
export const aliases = ['drop', 'delete', 'rm']
export const describe = chalk.green('remove an existing domain')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('id of the registered domain'),
    type: 'string',
  })
