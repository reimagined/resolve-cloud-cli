import columnify from 'columnify'
import chalk from 'chalk'

import refreshToken from '../refreshToken'
import { get } from '../api/client'
import { out, renderByTemplate } from '../utils/std'

type Deployment = {
  deploymentId: string
  applicationName: string
  version: string
  eventStoreId: string
  domainName: string
  deploymentTag?: string
  applicationUrl: string
}

export const handler = refreshToken(
  async (
    token: any,
    params: {
      format?: string
    }
  ) => {
    const { format } = params
    const { result } = await get(token, `/deployments`)

    if (result) {
      if (format) {
        result.map((deployment: Deployment) =>
          renderByTemplate(format, {
            ...deployment,
            applicationUrl: `https://${deployment.domainName}`,
          })
        )
        return
      }

      out(
        columnify(
          result.map(
            ({ deploymentId, version, eventStoreId, applicationName, domainName }: Deployment) => ({
              'application-name': applicationName,
              'deployment-id': deploymentId,
              version,
              'event-store-id': eventStoreId ?? 'N/A',
              domain: domainName,
            })
          ),
          {
            columnSplitter: '    ',
            columns: ['application-name', 'deployment-id', 'domain', 'version', 'event-store-id'],
          }
        )
      )
    }
  }
)

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
