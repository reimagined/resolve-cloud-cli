import columnify from 'columnify'
import chalk from 'chalk'
import type { CloudSdk, Deployment } from 'resolve-cloud-sdk'

import { out, renderByTemplate } from '../utils/std'
import commandHandler from '../command-handler'

export const getDeployment = async (params: {
  client: CloudSdk
  deploymentId: string
}): Promise<Deployment & { applicationUrl: string }> => {
  const { client, deploymentId } = params

  const deployment = await client.describeDeployment({
    deploymentId,
  })

  return {
    ...deployment,
    applicationUrl: deployment.domains.map((domain) => `https://${domain}`).join(' , '),
  }
}

export const handler = commandHandler(async ({ client }, params: any) => {
  const { format, deploymentId } = params

  const deployment = await getDeployment({
    client,
    deploymentId,
  })

  if (renderByTemplate(format, deployment)) {
    return
  }

  const { applicationName, version, eventStoreId, domains, applicationUrl } = deployment

  out(
    columnify(
      {
        'application-name': applicationName,
        'deployment-id': deploymentId,
        'application-url': applicationUrl,
        domain: domains,
        version,
        'event-store-id': eventStoreId ?? 'N/A',
      },
      { minWidth: 20, showHeaders: false, preserveNewLines: true }
    )
  )
})

export const command = 'describe <deployment-id>'
export const aliases = ['get']
export const describe = chalk.green('display information on the specified deployment')
export const builder = (yargs: any) =>
  yargs
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
    .option('format', {
      describe: `Format the output using a mustache template http://mustache.github.io/ 
      Possible fields: deploymentId, applicationName, eventStoreId, domainName, version, applicationUrl`,
      type: 'string',
    })
    .group(['format'], 'Options:')
    .example([
      [
        'EVENT_STORE=$(yarn -s resolve-cloud describe <deployment-id> --format="{{ eventStoreId }}")',
        'Save event-store-id in env',
      ],
    ])
