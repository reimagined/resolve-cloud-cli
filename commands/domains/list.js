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
        result.map(({ domain, addedAt, verified, bindings = {} }) => ({
          domain,
          verified,
          'added at': dateFormat(new Date(addedAt), 'm/d/yy HH:MM:ss'),
          bindings: Object.keys(bindings).join(',')
        })),
        {
          minWidth: 20,
          truncate: true,
          columns: ['domain', 'verified', 'added at', 'bindings']
        }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'list',
  aliases: ['ls', '$0'],
  describe: chalk.green("display a list of the user's domains"),
  builder: () => {}
}
