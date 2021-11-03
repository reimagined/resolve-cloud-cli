import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, saga: sagaName } = params

  return await client.pauseSaga({
    deploymentId,
    sagaName,
  })
})

export const command = 'pause <deployment-id> <saga>'
export const describe = chalk.green('stop handling events')
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
