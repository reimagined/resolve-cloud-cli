const chalk = require('chalk')
const log = require('consola')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')
const upload = require('../../api/upload')
const { LATEST_RUNTIME_SPECIFIER } = require('../../constants')

const handler = refreshToken(async (token, { runtime, events }) => {
  let initialEvents = null

  if (events != null) {
    log.debug(`Uploading events`)
    initialEvents = await upload(token, 'events', events)
    log.debug(`Events uploaded`)
  }

  const {
    result: { eventStoreId }
  } = await post(token, `eventStores`, {
    runtime,
    initialEvents
  })

  log.success(`Event store with "${eventStoreId}" id has been created`)
})

module.exports = {
  handler,
  command: 'create',
  describe: chalk.green("create the user's event store"),
  builder: yargs =>
    yargs
      .option('runtime', {
        describe: 'target runtime specifier',
        type: 'string',
        default: LATEST_RUNTIME_SPECIFIER
      })
      .option('events', {
        describe: 'initial events snapshot (new event stores only)',
        type: 'string'
      })
}
