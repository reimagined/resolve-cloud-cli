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
        result.map(
          ({ id, domainName, additionalNames, issuer, importedAt, notBefore, notAfter }) => ({
            id,
            'domain name': domainName,
            'additional names': isEmpty(additionalNames) ? 'N/A' : additionalNames.join(', '),
            issuer,
            imported: importedAt ? dateFormat(new Date(importedAt), 'm/d/yy HH:MM:ss') : 'N/A',
            'not before': notBefore ? dateFormat(new Date(notBefore), 'm/d/yy HH:MM:ss') : 'N/A',
            'not after': notAfter ? dateFormat(new Date(notAfter), 'm/d/yy HH:MM:ss') : 'N/A'
          })
        ),
        {
          minWidth: 20,
          truncate: true,
          columns: [
            'id',
            'domain name',
            'issuer',
            'imported',
            'not before',
            'not after',
            'additional names'
          ],
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
