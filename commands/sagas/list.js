const columnify = require('columnify')
const dateFormat = require('dateformat')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await get(token, `deployments/${deployment}/sagas`)
  if (result) {
    out(
      columnify(
        result.map(({ name, status, successEvent, errors }) => ({
          name,
          status,
          'last event': [
            successEvent &&
              successEvent.timestamp != null &&
              dateFormat(new Date(successEvent.timestamp), 'm/d/yy HH:MM:ss'),
            successEvent && successEvent.type
          ]
            .filter(Boolean)
            .join(' '),
          'last error': Array.isArray(errors) ? `${errors.map(e => e.stack).join('\n')}` : 'N\\A'
        })),
        {
          minWidth: 30,
          truncate: true,
          columns: ['name', 'status', 'last event', 'last error'],
          config: {
            'last error': {
              maxWidth: 160
            }
          }
        }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'list <deployment>',
  aliases: ['ls', '$0'],
  describe: chalk.green("display a list of an application's sagas"),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string'
    })
}
