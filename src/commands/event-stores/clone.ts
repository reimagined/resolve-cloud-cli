import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { disableLogger, logger, renderByTemplate } from '../../utils/std'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { 'event-store-id': sourceEventStoreId, format } = params

  if (format != null) {
    disableLogger()
  }

  const { eventStoreId: targetEventStoreId } = await client.cloneEventStore({
    eventStoreId: sourceEventStoreId,
  })

  if (renderByTemplate(format, { eventStoreId: targetEventStoreId })) {
    return
  }

  logger.success(`Event store with "${targetEventStoreId}" id has been created`)
})

export const command = 'clone <event-store-id>'
export const describe = chalk.green('clone an existing event store')
export const builder = (yargs: any) =>
  yargs
    .positional('event-store-id', {
      describe: chalk.green("an existing event store's id"),
      type: 'string',
    })
    .option('format', {
      describe: `Format the output using the given mustache template http://mustache.github.io/
      Possible fields: eventStoreId`,
      type: 'string',
    })
    .group(['format'], 'Options:')
    .example([
      ['yarn resolve-cloud event-stores create', 'Create new empty event store'],
      [
        'yarn resolve-cloud event-stores clone <event-store-id>',
        'Clone an existing event store by id',
      ],
      [
        'NEW_EVENT_STORE=$(yarn -s resolve-cloud event-stores clone <event-store-id> --format="{{ eventStoreId }}")',
        'Clone an existing event store and save its event-store-id in env',
      ],
    ])
