const chalk = require('chalk')
const log = require('consola')
const refreshToken = require('../../refreshToken')
const { del } = require('../../api/client')

const handler = refreshToken(async (token, { 'eventstore-id': eventStoreId }) => {
  await del(token, `eventStores/${eventStoreId}`)
  log.success(`Event store has been removed`)
})

module.exports = {
  handler,
  command: 'remove <eventstore-id>',
  aliases: ['rm'],
  describe: chalk.green("removes the user's event store"),
  builder: yargs =>
    yargs.positional('eventstore-id', {
      describe: chalk.green("an existing event store's id"),
      type: 'string'
    })
}
