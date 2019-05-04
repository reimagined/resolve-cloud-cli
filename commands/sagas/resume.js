// TODO: route
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { deployment, saga }) =>
  post(token, `deployments/${deployment}/sagas/${saga}/resume`)
)

module.exports = {
  handler,
  command: 'resume <deployment> <saga>',
  describe: chalk.green('resume saga event handling'),
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
