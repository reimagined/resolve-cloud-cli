const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(
  async (
    token,
    {
      deployment,
      'start-time': startTime,
      'end-time': endTime,
      'filter-pattern': filterPattern,
      'stream-limit': streamLimit
    }
  ) => {
    const { result } = await get(token, `deployments/${deployment}/logs`, {
      startTime,
      endTime,
      filterPattern,
      streamLimit
    })
    if (result) {
      out(result)
    }
  }
)

module.exports = {
  handler,
  command: 'get <deployment>',
  aliases: ['$0'],
  describe: chalk.green('retrieve application logs from the cloud'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .option('start-time', {
        alias: 's',
        describe: 'the timestamp at which the log should start',
        type: 'string'
      })
      .option('end-time', {
        alias: 'e',
        describe: 'the timestamp at which the log should end',
        type: 'string'
      })
      .option('filter-pattern', {
        alias: 'f',
        describe: 'a pattern used to filter the output',
        type: 'string'
      })
      .option('stream-limit', {
        alias: 'l',
        describe: 'a number of streams used to fetch logs',
        type: 'number'
      })
}
