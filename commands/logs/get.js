// TODO: route
// TODO: tests
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')

const handler = refreshToken(
  (token, { deployment, startTime, endTime, filterPattern, streamLimit }) =>
    get(token, `${deployment}/logs`, {
      startTime,
      endTime,
      filterPattern,
      streamLimit
    })
)

module.exports = {
  handler,
  command: 'get <deployment>',
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
        type: 'string'
      })
}
