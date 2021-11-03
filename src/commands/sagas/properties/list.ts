import columnify from 'columnify'
import chalk from 'chalk'

import commandHandler from '../../../command-handler'
import { out, renderByTemplate } from '../../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, saga: sagaName, format } = params

  const result = await client.listSagaProperties({
    deploymentId,
    sagaName,
  })

  if (format) {
    Object.entries(result).map(([key, value]) =>
      renderByTemplate(format, {
        name: key,
        value,
      })
    )
    return
  }

  if (result) {
    out(
      columnify(result, {
        columnSplitter: '    ',
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
    .option('format', {
      describe: `Format the output using the given mustache template http://mustache.github.io/
      Possible fields: name, value`,
      type: 'string',
    })
    .group(['format'], 'Options:')
