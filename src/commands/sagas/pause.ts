import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, saga } = params

  return await patch(token, `deployments/${deploymentId}/sagas/${saga}/pause`, {})
})

export const command = 'pause <deployment-id> <saga>'
export const describe = chalk.green('stop handling events')
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
