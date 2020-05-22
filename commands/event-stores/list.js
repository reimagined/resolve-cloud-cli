const columnify = require('columnify')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async token => {
  const { result } = await get(token, `eventStores`)

  if (result) {
    const eventStores = result.filter(store => store.status !== 'destroyed')

    out(
      columnify(eventStores, {
        minWidth: 20,
        truncate: true,
        columns: ['eventStoreId', 'major', 'createdAt', 'deploymentCount', 'userId']
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
