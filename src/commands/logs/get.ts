import chalk from 'chalk'
import { setTimeout } from 'timers'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const {
    deploymentId,
    'start-time': startTime,
    'end-time': endTime,
    'filter-pattern': filterPattern,
    'stream-limit': streamLimit,
    follow,
    offset = 15000,
  } = params

  const { result } = await get(token, `deployments/${deploymentId}/logs`, {
    startTime,
    endTime,
    filterPattern,
    streamLimit,
  })
  if (result) {
    out(result)
  }

  if (follow) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const tempStartTime = Date.now() - offset
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { result } = await get(token, `deployments/${deploymentId}/logs`, {
        startTime: tempStartTime,
        endTime,
        filterPattern,
        streamLimit,
      })
      if (result) {
        out(result)
      }
      await new Promise((resolve) => setTimeout(resolve, offset))
    }
  }
})

export const command = 'get <deployment-id>'
export const aliases = ['$0']
export const describe = chalk.green('retrieve application logs from the cloud')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .option('start-time', {
      alias: 's',
      describe: 'the timestamp at which the log should start',
      type: 'string',
    })
    .option('end-time', {
      alias: 'e',
      describe: 'the timestamp at which the log should end',
      type: 'string',
    })
    .option('filter-pattern', {
      alias: 'f',
      describe: 'a pattern used to filter the output',
      type: 'string',
    })
    .option('stream-limit', {
      alias: 'l',
      describe: 'a number of streams used to fetch logs',
      type: 'number',
    })
    .option('follow', {
      describe: 'a flag that defines that logs should be streamed in real time',
      type: 'boolean',
    })
    .option('offset', {
      describe: 'the time interval between log updates',
      type: 'number',
    })
    .group(
      ['start-time', 'end-time', 'filter-pattern', 'stream-limit', 'follow', 'offset'],
      'Options:'
    )
