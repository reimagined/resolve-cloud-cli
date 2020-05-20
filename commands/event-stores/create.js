const chalk = require('chalk')
const log = require('consola')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')
const { LATEST_RUNTIME_SPECIFIER } = require('../../constants')

const handler = refreshToken(async (token, { runtime }) => {
  const {
    result: { id }
  } = await post(token, `eventStores`, {
    runtime
  })

  log.success(`Event store with "${id}" id has been created`)
})

module.exports = {
  handler,
  command: 'create',
  describe: chalk.green("create the user's event store"),
  builder: yargs =>
    yargs.option('runtime', {
      describe: 'target runtime specifier',
      type: 'string',
      default: LATEST_RUNTIME_SPECIFIER
    })
}
