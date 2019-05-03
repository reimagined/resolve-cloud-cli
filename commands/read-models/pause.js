const log = require('consola')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')

const handler = refreshToken(async (token, {}) => {})

module.exports = {
  handler,
  command: 'pause',
  describe: chalk.green('pause read model updates'),
  builder: {}
}
