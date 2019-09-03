const columnify = require('columnify')
const dateFormat = require('dateformat')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async token => {
  const { result } = await get(token, `domains`)
  if (result) {
    out(
      columnify(
        result.map(({ domain, addedAt, verified, assignedTo }) => ({
          domain,
          verified,
          'added at': dateFormat(new Date(addedAt), 'm/d/yy HH:MM:ss'),
          assignedTo
        })),
        {
          minWidth: 20,
          truncate: true,
          columns: ['domain', 'verified', 'added at', 'assigned to']
        }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'list',
  aliases: ['ls', '$0'],
  describe: chalk.green("display a list of user's domains"),
  builder: () => {}
}
