import columnify from 'columnify'
import chalk from 'chalk'

import { get } from '../../api/client'
import { disableLogger, out, renderByTemplate } from '../../utils/std'
import refreshToken from '../../refreshToken'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, format } = params
  if (format != null) {
    disableLogger()
  }

  const { result } = await get(token, `deployments/${deploymentId}/environment`)

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
