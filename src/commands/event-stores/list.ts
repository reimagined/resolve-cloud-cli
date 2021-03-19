import columnify from 'columnify'
import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out, renderByTemplate } from '../../utils/std'

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
    const { result } = await get(token, `/event-stores`)

    if (result) {
      if (format) {
        result.map((deployment: Deployment) =>
          renderByTemplate(format, {
            ...deployment,
          })
        )
        return
      }
      out(
        columnify(
          result.map(
            ({
              eventStoreId,
              version: esVersion,
              linkedDeployments,
            }: {
              eventStoreId: string
              version: string
              linkedDeployments: string
            }) => ({
              id: eventStoreId,
              version: esVersion,
              'linked deployments': linkedDeployments,
            })
          ),
          {
            minWidth: 20,
            truncate: true,
            columns: ['id', 'linked deployments', 'version'],
          }
        )
      )
    }
  }
)

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green('display a list of event stores')
export const builder = (yargs: any) =>
  yargs
    .option('format', {
      describe: `Format the output using a mustache template http://mustache.github.io/ 
        Possible fields: eventStoreId, version`,
      type: 'string',
    })
    .group(['format'], 'Options:')
