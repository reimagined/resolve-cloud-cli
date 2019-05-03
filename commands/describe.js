// TODO: route
// TODO: tests
const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { get } = require('../api/client')

const handler = refreshToken(async (token, { deployment }) =>
  get(token, `deployments/${deployment}`)
)

module.exports = {
  handler,
  command: 'describe <deployment>',
  aliases: ['get'],
  describe: chalk.green('describe specific deployment'),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green('existing deployment id'),
      type: 'string'
    })
}
