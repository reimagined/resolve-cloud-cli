import columnify from 'columnify'
import chalk from 'chalk'
import semver from 'semver'

import { out, renderByTemplate } from '../utils/std'
import commandHandler from '../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { format } = params

  const result = await client.listDeployments()

  if (format) {
    result.map((deployment) =>
      renderByTemplate(format, {
        ...deployment,
        applicationUrl: deployment.domains.map((domain) => `https://${domain}`).join(' , '),
      })
    )
    return
  }

  out(
    columnify(
      result
        .map(({ deploymentId, version, eventStoreId, applicationName, domains }) => ({
          'application-name': applicationName,
          'deployment-id': deploymentId,
          version,
          'event-store-id': eventStoreId ?? 'N/A',
          domain: domains.join(','),
        }))
        .sort((a, b) => (semver.lt(a.version, b.version) ? 1 : -1)),
      {
        columnSplitter: '    ',
        columns: ['application-name', 'deployment-id', 'domain', 'version', 'event-store-id'],
      }
    )
  )
})

export const command = 'list'
export const aliases = ['ls']
export const describe = chalk.green('display a list of available deployments')
export const builder = (yargs: any) =>
  yargs
    .option('format', {
      describe: `Format the output using a mustache template http://mustache.github.io/ 
      Possible fields: deploymentId, applicationName, eventStoreId, domainName, version, applicationUrl`,
      type: 'string',
    })
    .group(['format'], 'Options:')
