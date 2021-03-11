import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id } = params

  return patch(token, `domains/${id}/verify`, {}, { [HEADER_EXECUTION_MODE]: 'async' })
})

export const command = 'verify <id>'
export const describe = chalk.green('request domain verification')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('id of the registered domain'),
    type: 'string',
  })
