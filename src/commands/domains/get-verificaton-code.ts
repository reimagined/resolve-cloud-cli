import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { logger } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id } = params

  const {
    result: { VerificationCode },
  } = await get(token, `domains/${id}/verification-code`)

  if (VerificationCode != null) {
    logger.info(`Your verification code - ${VerificationCode}`)
  } else {
    logger.info(`Domain "${id}" already verified`)
  }
})

export const command = 'get-verification-code <id>'
export const describe = chalk.green('request verification code')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('id of the registered domain'),
    type: 'string',
  })
