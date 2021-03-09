import dotenv from 'dotenv'
import chalk from 'chalk'

import { put } from '../../api/client'
import refreshToken from '../../refreshToken'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, variables } = params

  return put(token, `deployments/${deploymentId}/environment`, {
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
