import columnify from 'columnify'
import chalk from 'chalk'

import refreshToken from '../../../refreshToken'
import { out } from '../../../utils/std'
import { get } from '../../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, saga } = params

  const { result } = await get(token, `deployments/${deploymentId}/sagas/${saga}/properties`, {})

  if (result) {
    out(
      columnify(result, {
        minWidth: 30,
        columns: ['name', 'value'],
      })
    )
  }
})

export const command = 'list <deployment-id> <saga>'
export const aliases = ['ls', '$0']
export const describe = chalk.green('show a list of assigned properties')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .positional('saga', {
      describe: chalk.green("an existing saga's name"),
      type: 'string',
    })
