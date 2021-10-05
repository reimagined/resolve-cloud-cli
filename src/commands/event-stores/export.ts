import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import * as request from 'request'
import ProgressBar from 'progress'

import refreshToken from '../../refreshToken'
import { logger } from '../../utils/std'
import { get, patch } from '../../api/client'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const exportEventStore = async (params: {
  token: string
  eventStorePath: string
  eventStoreId: string
}) => {
  const { eventStorePath, eventStoreId, token } = params

  const pathToEventStore = path.resolve(process.cwd(), eventStorePath)

  if (!fs.existsSync(pathToEventStore)) {
    fs.mkdirSync(pathToEventStore)
  }

  const pathToEvents = path.join(pathToEventStore, 'events.db')
  const pathToSecrets = path.join(pathToEventStore, 'secrets.db')

  const {
    result: { eventsExportUrl, secretsExportUrl, statusFileUrl },
  } = await get(token, `/event-stores/${eventStoreId}/export`)

  await patch(token, `/event-stores/${eventStoreId}/export`, undefined, {
    [HEADER_EXECUTION_MODE]: 'async',
  })

  const interval = 16 * 60 * 1000 // 16 minutes
  let progressBar: ProgressBar
  let prevUploadedEvents = 0
  let startTime = Date.now()

  for (;;) {
    try {
      // eslint-disable-next-line no-loop-func
      const isComplete = await new Promise((resolve, reject) => {
        request.get(statusFileUrl, (error: Error, res: request.Response, body: any) => {
          if (error != null) {
            reject(error)
            return
          }

          if (res.statusCode === 404) {
            resolve(false)
            return
          }

          if (res.statusCode !== 200) {
            reject(new Error(res.statusMessage))
            return
          }

          const { eventsUploaded, eventCount, heartbeatTime } = JSON.parse(body)

          if (progressBar == null) {
            progressBar = new ProgressBar('  preparing event-store [:bar] :percent', {
              width: 50,
              total: eventCount,
            })

            progressBar.render()
          }

          if (prevUploadedEvents !== eventsUploaded) {
            progressBar.tick(eventsUploaded - prevUploadedEvents)
            prevUploadedEvents = eventsUploaded
            startTime = heartbeatTime
          }

          if (Date.now() - heartbeatTime > interval) {
            reject(new Error('Timeout'))
            return
          }

          if (eventsUploaded >= eventCount) {
            resolve(true)
          } else {
            resolve(false)
          }
        })
      })

      if (Date.now() - startTime > interval) {
        throw new Error('Timeout')
      }

      if (isComplete) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  await Promise.all(
    [
      {
        type: 'events',
        filePath: pathToEvents,
        exportUrl: eventsExportUrl,
      },
      {
        type: 'secrets',
        filePath: pathToSecrets,
        exportUrl: secretsExportUrl,
      },
    ].map(
      ({ type, exportUrl, filePath }) =>
        new Promise((resolve, reject) => {
          request
            .get(exportUrl)
            .on('response', (res) => {
              if (res.statusCode !== 200) {
                reject(new Error(res.statusMessage))
              } else {
                res.pipe(fs.createWriteStream(filePath))
              }

              if (type === 'events') {
                const size = res.headers['content-length']

                if (size == null) {
                  throw new Error('Failed to get "content-length" header')
                }

                const bar = new ProgressBar(`  downloading event-store [:bar] :percent`, {
                  width: 50,
                  total: +size,
                })

                res.on('data', (data) => {
                  bar.tick(data.length)
                })
              }
            })

            .on('complete', () => {
              resolve(true)
            })
            .on('error', (error) => {
              reject(error)
            })
        })
    )
  )
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { path: eventStorePath, 'event-store-id': eventStoreId } = params

  logger.start(`exporting the event-store from the cloud`)

  await exportEventStore({
    token,
    eventStorePath,
    eventStoreId,
  })

  logger.success('Export event-store successfully completed!')
})

export const describe = chalk.green('export an event store from the cloud')
export const command = 'export <event-store-id> <path>'
export const builder = (yargs: any) =>
  yargs
    .positional('event-store-id', {
      describe: chalk.green("an existing event store's id"),
      type: 'string',
    })
    .positional('path', {
      describe: chalk.green('path to the event store directory'),
      type: 'string',
    })
