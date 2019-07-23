const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { deployment, readmodel }) =>
  post(token, `deployments/${deployment}/read-models/${readmodel}/reset`)
)

module.exports = {
  handler,
  command: 'reset <deployment> <readmodel>',
  describe: chalk.green("reset a read model's state (full rebuild)"),
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
