const chalk = require('chalk')
const { del } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken((token, { deployment, name }) =>
  del(token, `${deployment}/secrets/${name}`)
)

module.exports = {
  handler,
  command: 'rm <deployment> <name>',
  describe: 'remove secret variable',
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('name', {
        describe: chalk.green('secret variable name'),
        type: 'string'
      })
}
