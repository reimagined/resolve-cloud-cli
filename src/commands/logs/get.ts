import chalk from 'chalk'
import { setTimeout } from 'timers'

import commandHandler from '../../command-handler'
import { out } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const {
    deploymentId,
    'start-time': startTime,
    'end-time': endTime,
    'filter-pattern': filterPattern,
    'stream-limit': streamLimit,
    follow,
    offset = 15000,
  } = params

  const logs = await client.getLogs({
    deploymentId,
    startTime,
    endTime,
    filterPattern,
    streamLimit,
  })

  if (logs !== '') {
    out(logs)
  }

  if (follow) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const tempStartTime = Date.now() - offset
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const followLogs = await client.getLogs({
        deploymentId,
        startTime: tempStartTime,
        endTime,
        filterPattern,
        streamLimit,
      })

      if (followLogs !== '') {
        out(followLogs)
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
