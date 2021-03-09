import chalk from 'chalk'

import refreshToken from '../../../refreshToken'
import { put } from '../../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, saga, property, value } = params

  return put(token, `deployments/${deploymentId}/sagas/${saga}/properties`, {
    key: property,
    value,
  })
})

export const command = 'set <deployment-id> <saga> <property> <value>'
export const describe = chalk.green("set a saga's property")
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
    .positional('value', {
      describe: chalk.green('property value'),
      type: 'string',
    })
