const columnify = require('columnify')
const chalk = require('chalk')
const refreshToken = require('../../../refreshToken')
const { out } = require('../../../utils/std')
const { get } = require('../../../api/client')

const handler = refreshToken(async (token, { deployment, saga }) => {
  const { result } = await get(token, `deployments/${deployment}/sagas/${saga}/properties`)
  if (result) {
    out(
      columnify(result, {
        minWidth: 30,
        columns: ['name', 'value']
      })
    )
  }
})

module.exports = {
  handler,
  command: 'list <deployment> <saga>',
  aliases: ['ls', '$0'],
  describe: chalk.green('show assigned saga properties'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green('existing deployment id'),
        type: 'string'
      })
      .positional('saga', {
        describe: chalk.green('existing saga name'),
        type: 'string'
      })
}
