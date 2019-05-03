// TODO: route
// TODO: test
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const handler = refreshToken(async (token, { deployment, readmodel }) =>
  post(token, `${deployment}/read-models/${readmodel}/reset`)
)

module.exports = {
  handler,
  command: 'reset <deployment> <readmodel>',
  describe: chalk.green('reset read model (full rebuild)'),
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
