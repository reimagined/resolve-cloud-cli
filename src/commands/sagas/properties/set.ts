import chalk from 'chalk'

import commandHandler from '../../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, saga: sagaName, property: key, value } = params

  await client.setSagaProperty({
    deploymentId,
    sagaName,
    key,
    value,
  })
})

export const command = 'set <deployment-id> <saga> <property> <value>'
export const describe = chalk.green("set a saga's property")
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
    .positional('value', {
      describe: chalk.green('property value'),
      type: 'string',
    })
