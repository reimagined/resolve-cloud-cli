const log = require('consola')
const chalk = require('chalk')
const refreshToken = require('../refreshToken')

const handler = refreshToken(async (token, {}) => {})

module.exports = {
  handler,
  command: 'describe',
  aliases: ['get'],
  describe: chalk.green('describe specific deployment'),
  builder: {}
}
