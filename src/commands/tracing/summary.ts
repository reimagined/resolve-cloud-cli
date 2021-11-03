import chalk from 'chalk'
import columnify from 'columnify'
import dateFormat from 'dateformat'

import commandHandler from '../../command-handler'
import { out } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, 'start-time': startTime, 'end-time': endTime } = params

  const result = await client.getSummaries({
    deploymentId,
    startTime,
    endTime,
  })

  if (result) {
    out(
      columnify(
        result.map((item) => {
          const { id, responseTime, http } = item
          return {
            id,
            url: http != null ? http.httpURL : '',
            time:
              id == null
                ? 'N/A'
                : `${dateFormat(
                    new Date(parseInt(id.split('-')[1] as string, 16) * 1000),
                    'm/d/yy HH:MM:ss'
                  )}`,
            latency: responseTime,
          }
        }),
        {
          minWidth: 20,
          columns: ['time', 'id', 'latency', 'url'],
        }
      )
    )
  }
})

export const command = 'summary <deployment-id>'
export const aliases = []
export const describe = chalk.green("retrieve the list of an application's performance traces")
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .option('start-time', {
      alias: 's',
      describe: 'the timestamp at which the traces should start',
      type: 'string',
    })
    .option('end-time', {
      alias: 'e',
      describe: 'the timestamp at which the traces should end',
      type: 'string',
    })
    .group(['start-time', 'end-time'], 'Options:')
