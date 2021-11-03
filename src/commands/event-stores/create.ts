import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { logger, renderByTemplate, disableLogger } from '../../utils/std'
import { getResolvePackageVersion } from '../../config'
import { importEventStore } from './import'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { 'import-from': eventStorePath, format } = params
  if (format != null) {
    disableLogger()
  }
  const version = getResolvePackageVersion()

  const { eventStoreId } = await client.createEventStore({
    version,
  })

  logger.info(`Event store ID: ${eventStoreId}`)

  if (eventStorePath != null) {
    await importEventStore({
      client,
      eventStorePath,
      eventStoreId,
      format,
    })
  }

  if (renderByTemplate(format, { eventStoreId })) {
    return
  }

  logger.success(`Event store with "${eventStoreId}" id has been created`)
})

export const command = 'create'
export const describe = chalk.green('create an event-store')
export const builder = (yargs: any) =>
  yargs
    .option('import-from', {
      describe: 'path to the previously exported event-store directory',
      type: 'string',
    })
    .option('format', {
      describe: `Format the output using the given mustache template http://mustache.github.io/
      Possible fields: eventStoreId`,
      type: 'string',
    })
    .group(['import-from', 'format'], 'Options:')
    .example([
      ['yarn resolve-cloud event-stores create', 'Create new empty event-store'],
      [
        'yarn resolve-cloud event-stores create --import-from=<path-to-event-store-directory>',
        'Create a new event store and import data from a previously exported event store directory',
      ],
      [
        'NEW_EVENT_STORE=$(yarn -s resolve-cloud event-stores create --format="{{ eventStoreId }}")',
        'Create a new empty event store and save its event-store-id in env',
      ],
    ])
