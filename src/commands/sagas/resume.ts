import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, saga: sagaName } = params

  return await client.resumeSaga({
    deploymentId,
    sagaName,
  })
})

export const command = 'resume <deployment-id> <saga>'
export const describe = chalk.green('resume handling events')
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
