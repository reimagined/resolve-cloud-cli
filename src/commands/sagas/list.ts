import columnify from 'columnify'
import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { out, formatEvent, renderByTemplate } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, format } = params

  const result = await client.listSagas({ deploymentId })

  if (format) {
    result.map(({ name, status, successEvent, failedEvent, errors }) =>
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
      result.map((item) => {
        const { name, status, successEvent, failedEvent, errors } = item
        return {
          name,
          status,
          'success event': formatEvent(successEvent),
          'failed event': formatEvent(failedEvent),
          'last error': Array.isArray(errors) ? `${errors.map((e) => e.stack).join('\n')}` : 'N\\A',
        }
      }),
      {
        columnSplitter: '    ',
        columns: ['name', 'status', 'success event', 'failed event', 'last error'],
      }
    )
  )
})

export const command = 'list <deployment-id>'
export const aliases = ['ls', '$0']
export const describe = chalk.green("display a list of an application's sagas")
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
