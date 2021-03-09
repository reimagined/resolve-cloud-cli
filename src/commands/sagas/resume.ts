import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'

export const handler = refreshToken(async (token: any, item: any) => {
  const { deploymentId, saga } = item

  return await patch(token, `deployments/${deploymentId}/sagas/${saga}/resume`, {})
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
