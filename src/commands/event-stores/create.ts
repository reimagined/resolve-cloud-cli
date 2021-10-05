import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { post } from '../../api/client'
import { logger, renderByTemplate, disableLogger } from '../../utils/std'
import { getResolvePackageVersion } from '../../config'
import { importEventStore } from './import'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'import-from': eventStorePath, format } = params
  if (format != null) {
    disableLogger()
  }
  const version = getResolvePackageVersion()

  const {
    result: { eventStoreId },
  } = await post(token, `/event-stores`, { version }, { [HEADER_EXECUTION_MODE]: 'async' })

  logger.info(`Event store ID: ${eventStoreId}`)

  if (eventStorePath != null) {
    await importEventStore({
      token,
      eventStorePath,
      eventStoreId,
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
