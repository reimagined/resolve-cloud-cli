const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await post(token, `deployments/${deployment}/tracing/enable`)
  if (result) {
    out(result)
  }
})

module.exports = {
  handler,
  command: 'enable <deployment>',
  aliases: [],
  describe: chalk.green('enable performance tracing'),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string'
    })
}
