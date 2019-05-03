const log = require('consola')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')

const handler = refreshToken(async (token, {}) => {})

module.exports = {
  handler,
  command: 'reset',
  describe: chalk.green('reset read model (full rebuild)'),
  builder: {}
}
