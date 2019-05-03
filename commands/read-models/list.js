const log = require('consola')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')

const handler = refreshToken(async (token, {}) => {})

module.exports = {
  handler,
  command: 'list',
  aliases: ['ls'],
  describe: chalk.green('show read model list'),
  builder: {}
}
