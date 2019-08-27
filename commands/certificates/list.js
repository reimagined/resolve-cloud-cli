const columnify = require('columnify')
const dateFormat = require('dateformat')
const isEmpty = require('lodash.isempty')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async token => {
  const { result } = await get(token, `certificates`)
  if (result) {
    out(
      columnify(
        result.map(({ id, domainName, additionalNames, issuer, importedAt }) => ({
          id,
          'domain name': domainName,
          'additional names': isEmpty(additionalNames) ? 'N/A' : additionalNames.join(', '),
          issuer,
          imported: dateFormat(new Date(importedAt), 'm/d/yy HH:MM:ss')
        })),
        {
          minWidth: 30,
          truncate: true,
          columns: ['id', 'domain name', 'issuer', 'imported', 'additional names'],
          config: {
            'additional names': {
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
