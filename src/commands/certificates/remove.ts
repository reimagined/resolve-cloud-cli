import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { id: certificateId } = params
  await client.dropCertificate({
    certificateId,
  })
  logger.success(`The certificate "${certificateId}" successfully deleted`)
})

export const command = 'remove <id>'
export const aliases = ['drop', 'delete', 'rm']
export const describe = chalk.green('remove an existing SSL certificate by its id')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('certificate id'),
    type: 'string',
  })
