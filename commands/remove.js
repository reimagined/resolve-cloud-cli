// TODO: route
// TODO: tests
const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { del } = require('../api/client')

const handler = refreshToken(async (token, { deployment }) =>
  del(token, `deployments/${deployment}`)
)

module.exports = {
  handler,
  command: 'remove',
  aliases: ['rm'],
  describe: chalk.green('remove specific deployment and all its data')
}
