const columnify = require('columnify')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await get(token, `deployments/${deployment}/sagas`)
  if (result) {
    out(
      columnify(
        result.map(({ name, status }) => ({
          name,
          status
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
  command: 'list',
  aliases: ['ls', '$0'],
  describe: chalk.green('display a list of available certificates'),
  builder: () => {}
}
