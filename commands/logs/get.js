const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(
  async (token, { deployment, startTime, endTime, filterPattern, streamLimit }) => {
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
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .option('startTime', {
        alias: 's',
        describe: 'logs start time',
        type: 'string'
      })
      .option('endTime', {
        alias: 'e',
        describe: 'logs end time',
        type: 'string'
      })
      .option('filterPattern', {
        alias: 'f',
        describe: 'filter pattern',
        type: 'string'
      })
      .option('streamLimit', {
        alias: 'l',
        describe: 'set output limit',
        type: 'number'
      })
}
