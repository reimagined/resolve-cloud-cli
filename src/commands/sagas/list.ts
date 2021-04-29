import columnify from 'columnify'
import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out, formatEvent } from '../../utils/std'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId } = params

  const { result } = await get(
    token,
    `deployments/${deploymentId}/sagas`,
    {},
    { [HEADER_EXECUTION_MODE]: 'async' }
  )
  if (result) {
    out(
      columnify(
        result.map((item: any) => {
          const { name, status, successEvent, failedEvent, errors } = item
          return {
            name,
            status,
            'success event': formatEvent(successEvent),
            'failed event': formatEvent(failedEvent),
            'last error': Array.isArray(errors)
              ? `${errors.map((e) => e.stack).join('\n')}`
              : 'N\\A',
          }
        }),
        {
          minWidth: 20,
          maxWidth: 100,
          columns: ['name', 'status', 'success event', 'failed event', 'last error'],
        }
      )
    )
  }
})

export const command = 'list <deployment-id>'
export const aliases = ['ls', '$0']
export const describe = chalk.green("display a list of an application's sagas")
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
