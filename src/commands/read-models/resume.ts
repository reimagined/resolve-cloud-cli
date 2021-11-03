import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, readmodel: readModelName } = params

  return await client.resumeReadModel({
    deploymentId,
    readModelName,
  })
})

export const command = 'resume <deployment-id> <readmodel>'
export const describe = chalk.green('resume read model updates')
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
