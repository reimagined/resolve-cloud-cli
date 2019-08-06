const chalk = require('chalk')
const { del } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken((token, { deployment, variables }) =>
  del(token, `deployments/${deployment}/environment`, { variables })
)

module.exports = {
  handler,
  command: 'remove <deployment> <variables...>',
  aliases: ['rm'],
  describe: chalk.green('remove environment variable'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .positional('variables', {
        describe: chalk.green('a list of variable names'),
        type: 'array'
      })
}
