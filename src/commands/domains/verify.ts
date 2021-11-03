import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { id: domainId } = params

  await client.verifyDomain({
    domainId,
  })
})

export const command = 'verify <id>'
export const describe = chalk.green('request domain verification')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('id of the registered domain'),
    type: 'string',
  })
