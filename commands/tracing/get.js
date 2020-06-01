const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { deployment, 'trace-id': traceId }) => {
  const { result } = await get(token, `deployments/${deployment}/tracing/details`, {
    traceIds: traceId
  })
  if (result) {
    out(JSON.stringify(result, null, 2))
  }
})

module.exports = {
  handler,
  command: 'get <deployment> <traceId>',
  aliases: [],
  describe: chalk.green("retrieve an application's performance trace from the cloud"),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .positional('trace-id', {
        describe: chalk.green("a trace's id"),
        type: 'string'
      })
}
