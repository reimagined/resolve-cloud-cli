const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { deployment, saga }) =>
  post(token, `deployments/${deployment}/sagas/${saga}/reset`)
)

module.exports = {
  handler,
  command: 'reset <deployment> <saga>',
  describe: chalk.green("reset a saga's state"),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .positional('saga', {
        describe: chalk.green("an existing saga's name"),
        type: 'string'
      })
}
