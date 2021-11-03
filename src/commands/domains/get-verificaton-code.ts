import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { id: domainId } = params

  const { verificationCode } = await client.getVerificationCode({
    domainId,
  })

  if (verificationCode != null) {
    logger.info(`Your verification code - ${verificationCode}`)
  } else {
    logger.info(`Domain "${domainId}" already verified`)
  }
})

export const command = 'get-verification-code <id>'
export const describe = chalk.green('request verification code')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('id of the registered domain'),
    type: 'string',
  })
