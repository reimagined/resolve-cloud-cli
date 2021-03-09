import chalk from 'chalk'

import refreshToken from '../../../refreshToken'
import { del } from '../../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, saga, property } = params

  return del(token, `deployments/${deploymentId}/sagas/${saga}/properties/${property}`, {})
})

export const command = 'delete <deployment-id> <saga> <property>'
export const aliases = ['rm', 'remove']
export const describe = chalk.green("delete a saga's property")
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
