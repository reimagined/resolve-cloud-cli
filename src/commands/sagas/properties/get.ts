import chalk from 'chalk'

import { get } from '../../../api/client'
import refreshToken from '../../../refreshToken'
import { out } from '../../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, saga, property } = params

  const { result } = await get(
    token,
    `deployments/${deploymentId}/sagas/${saga}/properties/${property}`,
    {}
  )

  out(JSON.parse(result))
})

export const command = `get <deployment-id> <saga> <property>`
export const describe = chalk.green('show a property')
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
