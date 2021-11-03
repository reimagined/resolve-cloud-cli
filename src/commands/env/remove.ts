import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, variables } = params

  await client.removeEnvironmentVariables({
    deploymentId,
    variables,
  })
})

export const command = 'remove <deployment-id> <variables...>'
export const aliases = ['rm']
export const describe = chalk.green('remove environment variables')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .positional('variables', {
      describe: chalk.green('a list of environment variables names'),
      type: 'array',
    })
