import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'
import { logger } from '../../utils/std'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id } = params
  await del(token, `certificates/${id}`, undefined, { [HEADER_EXECUTION_MODE]: 'async' })

  logger.success(`The certificate ${id} successfully deleted`)
})

export const command = 'remove <id>'
export const aliases = ['drop', 'delete', 'rm']
export const describe = chalk.green('remove an existing SSL certificate by its id')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('certificate id'),
    type: 'string',
  })
