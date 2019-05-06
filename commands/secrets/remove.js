const chalk = require('chalk')
const { del } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken((token, { deployment, name }) =>
  del(token, `deployments/${deployment}/secrets/${name}`)
)

module.exports = {
  handler,
  command: 'remove <deployment> <name>',
  aliases: ['rm'],
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
