const columnify = require('columnify')
const dateFormat = require('dateformat')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await get(token, `deployments/${deployment}/read-models`)
  if (result) {
    out(
      columnify(
        result.map(({ name, state, lastEvent, lastError }) => ({
          name,
          state,
          'last event': lastEvent
            ? `${dateFormat(new Date(lastEvent.timestamp), 'm/d/yy HH:MM:ss')} ${lastEvent.type}`
            : 'N\\A',
          'last error': lastError ? `${lastError.message}` : 'N\\A'
        })),
        {
          minWidth: 30,
          columns: ['name', 'state', 'last event', 'last error']
        }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'list <deployment>',
  aliases: ['ls', '$0'],
  describe: chalk.green('show read model list'),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green('existing deployment id'),
      type: 'string'
    })
}
