const chalk = require('chalk')
const columnify = require('columnify')
const dateFormat = require('dateformat')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { deployment, startTime, endTime }) => {
  let response
  let result = []
  let nextToken = null
  do {
    /* eslint-disable no-await-in-loop */
    response = await get(token, `deployments/${deployment}/tracing/summary`, {
      startTime,
      endTime,
      nextToken
    })
    /* eslint-enable */
    result = result.concat(
      response.result.TraceSummaries.map(trace => ({
        id: trace.Id,
        ts: parseInt(trace.Id.split('-')[1], 16),
        latency: trace.ResponseTime,
        url: trace.Http ? trace.Http.HttpURL : ''
      }))
    )
    nextToken = response.result.NextToken
  } while (nextToken)

  if (result) {
    out(
      columnify(
        result.map(({ id, ts, latency, url }) => ({
          id,
          url,
          time: `${dateFormat(new Date(ts * 1000), 'm/d/yy HH:MM:ss')}`,
          latency
        })),
        {
          minWidth: 20,
          columns: ['time', 'id', 'latency', 'url']
        }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'summary <deployment>',
  aliases: [],
  describe: chalk.green("retrieve the list of an application's performance traces"),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .option('startTime', {
        alias: 's',
        describe: 'the timestamp at which the traces should start',
        type: 'string'
      })
      .option('endTime', {
        alias: 'e',
        describe: 'the timestamp at which the traces should end',
        type: 'string'
      })
}
