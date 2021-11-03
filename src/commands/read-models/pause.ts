import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, readmodel: readModelName } = params

  await client.pauseReadModel({ deploymentId, readModelName })
})

export const command = 'pause <deployment-id> <readmodel>'
export const describe = chalk.green('pause read model updates')
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
