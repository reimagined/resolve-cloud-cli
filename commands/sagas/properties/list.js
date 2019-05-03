// TODO: route
// TODO: tests
const chalk = require('chalk')
const refreshToken = require('../../../refreshToken')
const { get } = require('../../../api/client')

const handler = refreshToken(async (token, { deployment, saga }) =>
  get(token`${deployment}/sagas/${saga}/properties`)
)

module.exports = {
  handler,
  command: 'list <deployment> <saga>',
  aliases: ['ls'],
  describe: chalk.green('show assigned saga properties'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('saga', {
        describe: chalk.green('existing saga name'),
        type: 'string'
      })
}
