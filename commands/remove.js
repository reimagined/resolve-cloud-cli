const log = require('consola')
const chalk = require('chalk')
const refreshToken = require('../refreshToken')

const handler = refreshToken(async (token, {}) => {})

module.exports = {
  handler,
  command: 'remove',
  aliases: ['rm'],
  describe: chalk.green('remove specific deployment and all its data'),
  builder: {}
}
