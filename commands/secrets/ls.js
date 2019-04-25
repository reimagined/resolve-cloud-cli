const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')

const handler = refreshToken((token, { deployment }) => get(token, `${deployment}/secrets`))

module.exports = {
  handler,
  command: 'ls <deployment>',
  describe: 'show all secrets',
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green('existing deployment id'),
      type: 'string'
    })
}
