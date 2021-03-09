import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id } = params

  return patch(token, `domains/${id}/verify`, {})
})

export const command = 'verify <id>'
export const describe = chalk.green('request domain verification')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('id of the registered domain'),
    type: 'string',
  })
