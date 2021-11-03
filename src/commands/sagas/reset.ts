import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, saga: sagaName } = params

  return await client.resetSaga({
    deploymentId,
    sagaName,
  })
})

export const command = 'reset <deployment-id> <saga>'
export const describe = chalk.green("reset a saga's state")
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
