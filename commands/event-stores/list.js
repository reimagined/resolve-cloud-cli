const columnify = require('columnify')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async token => {
  const { result } = await get(token, `eventStores`)
  if (result) {
    out(
      columnify(result, {
        minWidth: 20,
        truncate: true,
        columns: ['domain', 'verified', 'added at', 'bindings']
      })
    )
  }
})

module.exports = {
  handler,
  command: 'list',
  aliases: ['ls', '$0'],
  describe: chalk.green("display a list of the user's event stores"),
  builder: () => {}
}
