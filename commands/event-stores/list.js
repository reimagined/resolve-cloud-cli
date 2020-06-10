const columnify = require('columnify')
const chalk = require('chalk')
const dateFormat = require('dateformat')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async token => {
  const { result } = await get(token, `eventStores`)

  if (result) {
    const eventStores = result
      .filter(store => store.status !== 'destroyed')
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(store => ({
        ...store,
        id: store.eventStoreId,
        'created at': store.createdAt
          ? dateFormat(new Date(store.createdAt), 'm/d/yy HH:MM:ss')
          : 'N/A',
        'deployment count': store.deploymentCount
      }))

    out(
      columnify(eventStores, {
        minWidth: 20,
        truncate: true,
        columns: ['id', 'major', 'created at', 'deployment count', 'userId']
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
