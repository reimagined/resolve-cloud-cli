import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { aliases, 'certificate-id': certificateId, 'domain-id': rawDomainId } = params

  const { domainId, domainName, verificationCode } = await client.createDomain({
    domainId: rawDomainId,
    certificateId,
    aliases: aliases.split(',').map((alias: string) => alias.trim()),
  })

  logger.info(`Your domain "${domainName}" with id "${domainId}"`)

  if (verificationCode != null) {
    logger.info(`Your verification code is ${verificationCode}`)
    logger.info(
      `Add the following TXT verification record to your domain host's DNS settings: resolve-verification=${verificationCode}`
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
