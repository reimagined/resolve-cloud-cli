// TODO: route
// TODO: tests
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { deployment, saga }) =>
  post(token, `deployments/${deployment}/sagas/${saga}/pause`)
)

module.exports = {
  handler,
  command: 'pause <deployment> <saga>>',
  describe: chalk.green('stop saga event handling'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('saga', {
        describe: chalk.green('application saga name'),
        type: 'string'
      })
}
