import columnify from 'columnify'
import chalk from 'chalk'
import semver from 'semver'
import { Deployment } from 'resolve-cloud-sdk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out, renderByTemplate } from '../../utils/std'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(
  async (
    token: any,
    params: {
      format?: string
    }
  ) => {
    const { format } = params
    const { result } = await get(token, `/event-stores`, undefined, {
      [HEADER_EXECUTION_MODE]: 'async',
    })

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
          result
            .map(
              ({
                eventStoreId,
                version: esVersion,
                linkedDeployments,
                events,
                secrets,
                createdAt,
                modifiedAt,
              }: {
                eventStoreId: string
                version: string
                linkedDeployments: string
                events: number | null
                secrets: number | null
                createdAt: number | null
                modifiedAt: number | null
              }) => ({
                id: eventStoreId,
                version: esVersion,
                'linked deployments': linkedDeployments ?? 'N/A',
                events: events ?? 'N/A',
                secrets: secrets ?? 'N/A',
                created: createdAt != null ? new Date(createdAt).toISOString() : 'N/A',
                'latest event': modifiedAt != null ? new Date(modifiedAt).toISOString() : 'N/A',
              })
            )
            .sort((a: Deployment, b: Deployment) => (semver.lt(a.version, b.version) ? 1 : -1)),
          {
            minWidth: 6,
            truncate: true,
            columnSplitter: '    ',
            columns: [
              'id',
              'linked deployments',
              'version',
              'events',
              'secrets',
              'created',
              'latest event',
            ],
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
        Possible fields: eventStoreId, version, linkedDeployments, events, secrets, createdAt, modifiedAt`,
      type: 'string',
    })
    .group(['format'], 'Options:')
