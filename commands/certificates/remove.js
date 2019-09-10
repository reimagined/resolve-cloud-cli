const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { del } = require('../../api/client')

const handler = refreshToken(async (token, { id }) => del(token, `certificates/${id}`))

module.exports = {
  handler,
  command: 'rm <id>',
  aliases: ['remove', 'delete'],
  describe: chalk.green('remove an existing SSL certificate by its id'),
  builder: yargs =>
    yargs.positional('id', {
      describe: chalk.green('an id of an existing certificate'),
      type: 'string'
    })
}
