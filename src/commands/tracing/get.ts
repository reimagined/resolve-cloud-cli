import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, 'trace-id': traceId } = params

  const { result } = await get(token, `deployments/${deploymentId}/tracing/details`, {
    traceIds: traceId,
  })

  out(JSON.stringify(result, null, 2))
})

export const command = 'get <deployment-id> <traceId>'
export const describe = chalk.green("retrieve an application's performance trace from the cloud")
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .positional('trace-id', {
      describe: chalk.green("a trace's id"),
      type: 'string',
    })
