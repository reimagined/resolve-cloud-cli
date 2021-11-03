import chalk from 'chalk'

import commandHandler from '../../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, saga: sagaName, property: key } = params

  await client.deleteSagaProperty({
    deploymentId,
    sagaName,
    key,
  })
})

export const command = 'delete <deployment-id> <saga> <property>'
export const aliases = ['rm', 'remove']
export const describe = chalk.green("delete a saga's property")
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .positional('saga', {
      describe: chalk.green("an existing saga's name"),
      type: 'string',
    })
    .positional('property', {
      describe: chalk.green('property name'),
      type: 'string',
    })
