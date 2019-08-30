const columnify = require('columnify')
const dateFormat = require('dateformat')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async token => {
  const { result } = await get(token, `aliases`)
  if (result) {
    out(
      columnify(
        result.map(({ alias, target, deploymentId, updatedAt, certificateId }) => ({
          deployment: deploymentId,
          alias,
          cname: target,
          certificate: certificateId,
          'updated at': dateFormat(new Date(updatedAt), 'm/d/yy HH:MM:ss')
        })),
        {
          minWidth: 30,
          truncate: true,
          columns: ['deployment', 'alias', 'cname', 'certificate', 'updated at']
        }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'list',
  aliases: ['ls', '$0'],
  describe: chalk.green('display a list of deployments aliases'),
  builder: () => {}
}
