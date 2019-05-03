const log = require('consola')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')

const handler = refreshToken(async (token, {}) => {})

module.exports = {
  handler,
  command: 'resume',
  describe: chalk.green('resume saga event handling'),
  builder: {}
}
