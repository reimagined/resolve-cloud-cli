import chalk from 'chalk'

import commandHandler from '../../../command-handler'
import { out } from '../../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, saga: sagaName, property: key } = params

  const result = await client.getSagaProperty({
    deploymentId,
    sagaName,
    key,
  })

  out(result)
})

export const command = `get <deployment-id> <saga> <property>`
export const describe = chalk.green('show a property')
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
