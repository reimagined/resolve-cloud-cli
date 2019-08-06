const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await get(token, `deployments/${deployment}/tracing/status`)
  if (result) {
    out(result)
  }
})

module.exports = {
  handler,
  command: 'status <deployment>',
  aliases: [],
  describe: chalk.green("retrieve an application's performance tracing status"),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string'
    })
}
