import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import fetch from 'node-fetch'
import type { CloudSdk } from 'resolve-cloud-sdk'

import { logger } from '../../utils/std'
import commandHandler from '../../command-handler'
import ProgressBar from '../../utils/progress-bar'

export const exportEventStore = async (params: {
  client: CloudSdk
  eventStorePath: string
  eventStoreId: string
}) => {
  const { eventStorePath, eventStoreId, client } = params

  const pathToEventStore = path.resolve(process.cwd(), eventStorePath)

  if (!fs.existsSync(pathToEventStore)) {
    fs.mkdirSync(pathToEventStore)
  }

  const pathToEvents = path.join(pathToEventStore, 'events.db')
  const pathToSecrets = path.join(pathToEventStore, 'secrets.db')

  const { eventsExportUrl, secretsExportUrl, statusFileUrl } = await client.getExportUrls({
    eventStoreId,
  })

  await client.exportEvents({
    eventStoreId,
  })

  const interval = 16 * 60 * 1000 // 16 minutes
  let progressBar: ProgressBar
  let prevUploadedEvents = 0
  let startTime = Date.now()
  let skipExport = false

  for (;;) {
    try {
      // eslint-disable-next-line no-loop-func
      const isComplete = await new Promise(async (resolve, reject) => {
        try {
          const res = await fetch(statusFileUrl, {
            method: 'GET',
          })

          if (res.status === 404) {
            resolve(false)
            return
          }

          if (res.status !== 200) {
            throw new Error(await res.text())
          }

          const { eventsUploaded, eventCount, heartbeatTime } = await res.json()

          if (eventCount === 0) {
            skipExport = true
            return resolve(true)
          }

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
        } catch (error) {
          reject(error)
        }
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

  if (skipExport) {
    return
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
    ].map(({ type, exportUrl, filePath }) => {
      const callback = async (resolve: any, reject: any) => {
        try {
          const res = await fetch(exportUrl, {
            method: 'GET',
          })

          if (!res.ok) {
            throw new Error(await res.text())
          }

          const fileStream = fs.createWriteStream(filePath)

          await new Promise<void>(async (_resolve, _reject) => {
            res.body.on('error', _reject)
            fileStream.on('finish', _resolve)

            if (type === 'events') {
              const size = res.headers.get('content-length')

              if (size != null) {
                const bar = new ProgressBar(`  downloading event-store [:bar] :percent`, {
                  width: 50,
                  total: +size,
                })

                for await (const chunk of res.body) {
                  fileStream.write(chunk)
                  bar.tick(chunk.length)
                }
              }
            } else {
              res.body.pipe(fileStream)
            }
          })

          resolve()
        } catch (error) {
          reject(error)
        }
      }
      return new Promise(callback).catch(async (error) => {
        void error
        await new Promise((resolve) => setTimeout(resolve, 5000))
        return new Promise(callback)
      })
    })
  )
}

export const handler = commandHandler(async ({ client }, params: any) => {
  const { path: eventStorePath, 'event-store-id': eventStoreId } = params

  logger.start(`exporting the event-store from the cloud`)

  await exportEventStore({
    client,
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
