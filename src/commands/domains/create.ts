import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { post } from '../../api/client'
import { logger } from '../../utils/std'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { aliases, 'certificate-id': certificateId, 'domain-id': domainId } = params

  const {
    result: { DomainName, DomainId, VerificationCode },
  } = await post(
    token,
    `domains`,
    {
      aliases: aliases.split(',').map((alias: string) => alias.trim()),
      certificateId,
      domainId,
    },
    { [HEADER_EXECUTION_MODE]: 'async' }
  )

  logger.info(`Your domain "${DomainName}" with id "${DomainId}"`)

  if (VerificationCode != null) {
    logger.info(`Your verification code is ${VerificationCode}`)
    logger.info(
      `Add the following TXT verification record to your domain host's DNS settings: resolve-verification=${VerificationCode}`
    )
  }
})

export const command = 'create'
export const aliases = ['register']
export const describe = chalk.green('register a new domain')
export const builder = (yargs: any) =>
  yargs
    .option('certificate-id', {
      alias: 'cert',
      describe: 'the id of an SSL certificate to use',
      type: 'string',
      demand: 'a certificate id is required',
    })
    .option('aliases', {
      alias: 'a',
      describe: 'aliases for domain',
      type: 'string',
      demand: 'an aliases is required',
    })
    .option('domain-id', {
      alias: 'id',
      describe: 'the id for existing domain',
      type: 'string',
    })
    .group(['certificate-id', 'aliases', 'domain-id'], 'Options:')
    .example([
      [
        'yarn resolve-cloud domains create --aliases="<custom-domain-name>","*.<custom-domain-name>" --certificate-id=<certificate-id>',
        'Create a new domain',
      ],
    ])
