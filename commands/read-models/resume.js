// TODO: route
// TODO: test
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { deployment, readmodel }) =>
  post(token, `deployments/${deployment}/read-models/${readmodel}/resume`)
)

module.exports = {
  handler,
  command: 'resume <deployment> <readmodel>',
  describe: chalk.green('resume read model updates'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('readmodel', {
        describe: chalk.green('existing read model name'),
        type: 'string'
      })
}
