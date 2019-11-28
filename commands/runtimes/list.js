const columnify = require('columnify')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async token => {
  const { result } = await get(token, `runtimes`)
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
  aliases: ['ls', '$0'],
  describe: chalk.green('display a list of the available runtimes'),
  builder: () => {}
}
