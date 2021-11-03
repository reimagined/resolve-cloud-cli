import columnify from 'columnify'
import chalk from 'chalk'
import semver from 'semver'

import commandHandler from '../../command-handler'
import { out, renderByTemplate } from '../../utils/std'

export const handler = commandHandler(
  async (
    { client },
    params: {
      format?: string
    }
  ) => {
    const { format } = params

    const result = await client.listEventStores()

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
          isFrozen,
        }) =>
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
            frozen: isFrozen != null ? `${isFrozen}` : 'N/A',
            isFrozen: isFrozen != null ? `${isFrozen}` : 'N/A',
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
              isFrozen,
            }) => ({
              id: eventStoreId,
              version: esVersion,
              'linked deployments': linkedDeployments ?? 'N/A',
              events: events ?? 'N/A',
              secrets: secrets ?? 'N/A',
              created: createdAt != null ? new Date(createdAt).toISOString() : 'N/A',
              'latest event': modifiedAt != null ? new Date(modifiedAt).toISOString() : 'N/A',
              frozen: isFrozen != null ? `${isFrozen}` : 'N/A',
            })
          )
          .sort((a, b) => (semver.lt(a.version, b.version) ? 1 : -1)),
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
            'frozen',
          ],
        }
      )
    )
  }
)

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green('display a list of event stores')
export const builder = (yargs: any) =>
  yargs
    .option('format', {
      describe: `Format the output using a mustache template http://mustache.github.io/ 
        Possible fields: id, version, linkedDeployments, events, secrets, created, latestEvent, frozen`,
      type: 'string',
    })
    .group(['format'], 'Options:')
