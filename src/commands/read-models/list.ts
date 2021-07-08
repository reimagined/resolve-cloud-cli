import columnify from 'columnify'
import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out, formatEvent, renderByTemplate } from '../../utils/std'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, format } = params

  const { result } = await get(
    token,
    `deployments/${deploymentId}/read-models`,
    {},
    { [HEADER_EXECUTION_MODE]: 'async' }
  )
  if (result) {
    if (format) {
      result.map(({ name, status, successEvent, failedEvent, errors }: any) =>
        renderByTemplate(format, {
          name,
          status,
          successEvent: formatEvent(successEvent).trim(),
          failedEvent: formatEvent(failedEvent).trim(),
          errors: Array.isArray(errors) ? `${errors.map((e) => e.stack).join('\n')}` : 'N\\A',
        })
      )
      return
    }

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
export const describe = chalk.green("display a list of an application's read models")
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .option('format', {
      describe: `Format the output using a mustache template http://mustache.github.io/ 
      Possible fields: name, status, successEvent, failedEvent, errors`,
      type: 'string',
    })
    .group(['format'], 'Options:')
