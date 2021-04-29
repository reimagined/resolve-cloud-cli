import columnify from 'columnify'
import chalk from 'chalk'
import { Deployment } from 'resolve-cloud-sdk'

import refreshToken from '../refreshToken'
import { get } from '../api/client'
import { out, renderByTemplate } from '../utils/std'

export const getDeployment = async (params: {
  token: string
  deploymentId?: string
}): Promise<Deployment & { applicationUrl: string }> => {
  const { token, deploymentId } = params

  const { result } = await get(token, `/deployments/${deploymentId}`)

  if (result == null) {
    throw new Error(`Deployment is not found`)
  }

  result.applicationUrl = `https://${result.domainName}`

  return result
}

export const handler = refreshToken(
  async (
    token: string,
    params: {
      deploymentId: string
      format?: string
    }
  ) => {
    const { format } = params

    const deployment = await getDeployment({
      token,
      deploymentId: params.deploymentId,
    })

    if (renderByTemplate(format, deployment)) {
      return
    }

    const {
      applicationName,
      version,
      eventStoreId,
      domainName,
      applicationUrl,
      deploymentId,
    } = deployment

    out(
      columnify(
        {
          'application-name': applicationName,
          'deployment-id': deploymentId,
          'application-url': applicationUrl,
          domain: domainName,
          version,
          'event-store-id': eventStoreId ?? 'N/A',
        },
        { minWidth: 20, showHeaders: false, preserveNewLines: true }
      )
    )
  }
)

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
