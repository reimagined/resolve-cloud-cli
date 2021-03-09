import columnify from 'columnify'
import dateFormat from 'dateformat'
import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId } = params

  const { result } = await get(token, `deployments/${deploymentId}/read-models`, {})
  if (result) {
    out(
      columnify(
        result.map((item: any) => {
          const { name, status, successEvent, errors } = item
          return {
            name,
            status,
            'last event': successEvent
              ? `${
                  successEvent.type !== 'Init'
                    ? dateFormat(new Date(successEvent.timestamp), 'm/d/yy HH:MM:ss')
                    : ''
                } ${successEvent.type}`
              : 'N\\A',
            'last error': Array.isArray(errors)
              ? `${errors.map((e) => e.stack).join('\n')}`
              : 'N\\A',
          }
        }),
        {
          minWidth: 30,
          maxWidth: 100,
          columns: ['name', 'status', 'last event', 'last error'],
        }
      )
    )
  }
})

export const command = 'list <deployment-id>'
export const aliases = ['ls', '$0']
export const describe = chalk.green("display a list of an application's read models")
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
