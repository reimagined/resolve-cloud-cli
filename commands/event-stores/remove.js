const chalk = require('chalk')
const log = require('consola')
const refreshToken = require('../../refreshToken')
const { del } = require('../../api/client')

const handler = refreshToken(async (token, { eventStoreId }) => {
  await del(token, `eventStores/${eventStoreId}`)
  log.success(`Event store has been removed`)
})

module.exports = {
  handler,
  command: 'remove <eventStoreId>',
  aliases: ['rm'],
  describe: chalk.green("removes the user's event store"),
  builder: yargs =>
    yargs.positional('eventStoreId', {
      describe: chalk.green("an existing event store's id"),
      type: 'string'
    })
}
