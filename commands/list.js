const columnify = require('columnify')
const chalk = require('chalk')
const refreshToken = require('../refreshToken')
const { get } = require('../api/client')
const { out } = require('../utils/std')

const handler = refreshToken(async token => {
  const { result } = await get(token, `deployments`)

  if (result) {
    out(
      columnify(result, {
        minWidth: 30
      })
    )
  }
})

module.exports = {
  handler,
  command: 'list',
  aliases: ['ls'],
  describe: chalk.green('display a list of available deployments')
}
