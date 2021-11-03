import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, readmodel: readModelName } = params

  return await client.resetReadModel({
    deploymentId,
    readModelName,
  })
})

export const command = 'reset <deployment-id> <readmodel>'
export const describe = chalk.green("reset a read model's state (full rebuild)")
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .positional('readmodel', {
      describe: chalk.green("an existing read model's name"),
      type: 'string',
    })
