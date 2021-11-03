import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { id: domainId } = params

  await client.dropDomain({
    domainId,
  })
})

export const command = 'remove <id>'
export const aliases = ['drop', 'delete', 'rm']
export const describe = chalk.green('remove an existing domain')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('id of the registered domain'),
    type: 'string',
  })
