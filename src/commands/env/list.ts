import columnify from 'columnify'
import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { disableLogger, out, renderByTemplate } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, format } = params
  if (format != null) {
    disableLogger()
  }

  const result = await client.listEnvironmentVariables({
    deploymentId,
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

  out(
    columnify(result, {
      columnSplitter: '    ',
      columns: ['name', 'value'],
    })
  )
})

export const command = `list <deployment-id>`
export const describe = chalk.green('display a list of environment variables')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .option('format', {
      describe: `Format the output using the given mustache template http://mustache.github.io/
      Possible fields: name, value`,
      type: 'string',
    })
    .group(['format'], 'Options:')
    .example([
      ['yarn resolve-cloud env list --format="{{ name }}:{{ value }}"', 'Formatted output list'],
    ])
