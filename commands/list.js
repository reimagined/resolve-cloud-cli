// TODO: route
const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { get } = require('../api/client')

const handler = refreshToken(async token => get(token, `deployments`))

module.exports = {
  handler,
  command: 'list',
  aliases: ['ls'],
  describe: chalk.green('show deployment list')
}
