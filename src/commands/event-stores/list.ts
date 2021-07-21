import columnify from 'columnify'
import chalk from 'chalk'
import semver from 'semver'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out, renderByTemplate } from '../../utils/std'
import { HEADER_EXECUTION_MODE } from '../../constants'

type EventStore = {
  eventStoreId: string
  version: string
  linkedDeployments: string
  events: number | null
  secrets: number | null
  createdAt: number | null
  modifiedAt: number | null
}

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
        result.map(
          ({
            eventStoreId,
            version: esVersion,
            linkedDeployments,
            events,
            secrets,
            createdAt,
            modifiedAt,
          }: EventStore) =>
            renderByTemplate(format, {
              eventStoreId,
              id: eventStoreId,
              version: esVersion,
              linkedDeployments: linkedDeployments ?? 'N/A',
              events: events ?? 'N/A',
              secrets: secrets ?? 'N/A',
              created: createdAt != null ? new Date(createdAt).toISOString() : 'N/A',
              createdAt: createdAt != null ? new Date(createdAt).toISOString() : 'N/A',
              latestEvent: modifiedAt != null ? new Date(modifiedAt).toISOString() : 'N/A',
              modifiedAt: modifiedAt != null ? new Date(modifiedAt).toISOString() : 'N/A',
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
              }: EventStore) => ({
                id: eventStoreId,
                version: esVersion,
                'linked deployments': linkedDeployments ?? 'N/A',
                events: events ?? 'N/A',
                secrets: secrets ?? 'N/A',
                created: createdAt != null ? new Date(createdAt).toISOString() : 'N/A',
                'latest event': modifiedAt != null ? new Date(modifiedAt).toISOString() : 'N/A',
              })
            )
            .sort((a: EventStore, b: EventStore) => (semver.lt(a.version, b.version) ? 1 : -1)),
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
        Possible fields: id, version, linkedDeployments, events, secrets, created, latestEvent`,
      type: 'string',
    })
    .group(['format'], 'Options:')
