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
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .positional('readmodel', {
        describe: chalk.green("an existing read model's name"),
        type: 'string'
      })
}
