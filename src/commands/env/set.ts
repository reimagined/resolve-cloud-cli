import dotenv from 'dotenv'
import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, variables } = params

  await client.setEnvironmentVariables({
    deploymentId,
    variables: dotenv.parse(Buffer.from(variables.join('\n'))),
  })
})

export const command = `set <deployment-id> <variables...>`
export const describe = chalk.green('set environment variables')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .positional('variables', {
      describe: chalk.green('a list of key=value pairs'),
      type: 'array',
    })
