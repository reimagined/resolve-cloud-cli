import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import readline from 'readline'
import * as request from 'request'
import type { CloudSdk } from 'resolve-cloud-sdk'

import { logger } from '../../utils/std'
import ProgressBar from '../../utils/progress-bar'
import commandHandler from '../../command-handler'

const PART_SIZE = 100 * 1024 * 1024 // 100 MB in Bytes
const eventFieldsQueue = [
  'threadId',
  'threadCounter',
  'timestamp',
  'aggregateId',
  'aggregateVersion',
  'type',
  'payload',
  'eventSize',
]
const secretFieldsQueue = ['idx', 'id', 'secret']

const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`
const getPathToEvents = (eventStorePath: string) =>
  path.resolve(process.cwd(), eventStorePath, 'events.db')
const getPathToSecrets = (eventStorePath: string) =>
  path.resolve(process.cwd(), eventStorePath, 'secrets.db')

async function* generator(filePath: string, type: string, size: number, format?: string) {
  const readStream = fs.createReadStream(filePath)
  const readByLine = readline.createInterface(readStream)

  if (type === 'events') {
    const bar = new ProgressBar(`  preparing event-store [:bar] :percent`, {
      width: 50,
      total: size,
      format,
    })

    readStream.on('data', (chunk) => {
      bar.tick(chunk.length)
    })
  }

  for await (const line of readByLine) {
    const eventStoreItem = JSON.parse(line)
    const chunk = filePath.includes('events.db')
      ? eventFieldsQueue
          .map((key) => {
            if (key === 'payload') {
              return escapeCsv(JSON.stringify(eventStoreItem[key]))
            }
            if (key === 'aggregateId' || key === 'type') {
              return escapeCsv(eventStoreItem[key] as string)
            }
            if (key === 'eventSize' && eventStoreItem[key] == null) {
              const serializedEvent = [
                `"${eventStoreItem.aggregateId}",`,
                `${+eventStoreItem.aggregateVersion},`,
                `"${eventStoreItem.type}",`,
                `"${JSON.stringify(
                  eventStoreItem.payload != null ? eventStoreItem.payload : null
                )}"`,
              ].join('')

              return Buffer.byteLength(serializedEvent) + 66
            }
            return eventStoreItem[key]
          })
          .join(',')
      : secretFieldsQueue
          .map((key) => {
            if (key === 'id' || key === 'secret') {
              return escapeCsv(eventStoreItem[key] as string)
            }
            return eventStoreItem[key]
          })
          .join(',')

    yield `${chunk}\n`
  }
}

const generateCsv = async (eventStorePath: string, format?: string) => {
  const pathToEvents = getPathToEvents(eventStorePath)
  const pathToSecrets = getPathToSecrets(eventStorePath)

  return (await Promise.all(
    [
      {
        type: 'events',
        originalFilePath: pathToEvents,
      },
      {
        type: 'secrets',
        originalFilePath: pathToSecrets,
      },
    ].map(
      ({ originalFilePath, type }) =>
        new Promise(async (resolve, reject) => {
          const { size } = fs.statSync(originalFilePath)
          const readStream = generator(originalFilePath, type, size, format)

          let chunkSize = 0
          let part = 0
          const pathsToCsv = [path.resolve(process.cwd(), eventStorePath, `${type}-${part}.csv`)]
          let writeStream = fs.createWriteStream(pathsToCsv[part] as any)

          try {
            for await (const line of readStream) {
              chunkSize += Buffer.byteLength(line)

              if (chunkSize >= PART_SIZE) {
                chunkSize = 0
                part += 1
                pathsToCsv.push(path.resolve(process.cwd(), eventStorePath, `${type}-${part}.csv`))
                writeStream = fs.createWriteStream(pathsToCsv[part] as any)
              }

              writeStream.write(line)
            }
            resolve({
              type,
              partCount: part + 1,
              pathsToCsv,
            })
          } catch (error) {
            reject(error)
          }
        })
    )
  )) as Array<{
    type: string
    partCount: number
    pathsToCsv: Array<string>
  }>
}

const deleteCsv = async (items: Array<{ pathsToCsv: Array<string> }>) => {
  for (const { pathsToCsv } of items) {
    for (const filePath of pathsToCsv) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
  }
}

export const importEventStore = async (params: {
  client: CloudSdk
  eventStorePath: string
  eventStoreId: string
  format?: string
}) => {
  const { eventStorePath, eventStoreId, client, format } = params

  const pathToEvents = getPathToEvents(eventStorePath)
  const pathToSecrets = getPathToSecrets(eventStorePath)

  if (!fs.existsSync(pathToEvents)) {
    throw new Error(`No such file or directory "${pathToEvents}"`)
  }

  if (!fs.existsSync(pathToSecrets)) {
    throw new Error(`No such file or directory "${pathToSecrets}"`)
  }

  const generatedFiles = await generateCsv(eventStorePath, format)

  try {
    const eventsPartsInfo = generatedFiles.find(({ type }) => type === 'events')
    const secretsPartsInfo = generatedFiles.find(({ type }) => type === 'secrets')

    if (eventsPartsInfo == null) {
      throw new Error('Failed to prepare events for import')
    }

    if (secretsPartsInfo == null) {
      throw new Error('Failed to prepare secrets for import')
    }

    const { eventsImportUrls, secretsImportUrls } = await client.getImportUrls({
      eventStoreId,
      eventsPartCount: eventsPartsInfo.partCount,
      secretsPartCount: secretsPartsInfo.partCount,
    })

    const uploadingBar = new ProgressBar(`  uploading event-store [:bar] :percent`, {
      width: 50,
      total: eventsPartsInfo.partCount + secretsPartsInfo.partCount,
      format,
    })

    logger.debug(`upload events and secrets`)
    try {
      await Promise.all(
        (
          [
            ...eventsImportUrls.map(
              (url: string, idx: number) =>
                ({
                  uploadUrl: url,
                  filePath: eventsPartsInfo.pathsToCsv[idx] as string,
                } as const)
            ),
            ...secretsImportUrls.map(
              (url: string, idx: number) =>
                ({
                  uploadUrl: url,
                  filePath: secretsPartsInfo.pathsToCsv[idx] as string,
                } as const)
            ),
          ] as const
        ).map(
          ({ filePath, uploadUrl }) =>
            new Promise((resolve, reject) => {
              const fileSizeInBytes = fs.lstatSync(filePath).size
              if (fileSizeInBytes === 0) {
                uploadingBar.tick()
                return resolve(true)
              }
              const contentType = 'text/csv'
              const fileStream = fs.createReadStream(filePath)
              request
                .put({
                  uri: uploadUrl,
                  headers: {
                    'Content-Length': fileSizeInBytes,
                    'Content-Type': contentType,
                  },
                  body: fileStream,
                })
                .on('complete', () => {
                  uploadingBar.tick()
                  resolve(true)
                })
                .on('error', (error) => {
                  reject(error)
                })
            })
        )
      )
      logger.debug(`events and secrets have been uploaded`)
    } catch (error) {
      logger.debug(`failed to upload events and secrets`)
      throw new Error(error)
    }

    const totalPartCount = Math.max(eventsPartsInfo.partCount, secretsPartsInfo.partCount)

    const importingBar = new ProgressBar(`  importing event-store [:bar] :percent`, {
      width: 50,
      total: totalPartCount,
      format,
    })

    for (let partIndex = 0; partIndex < totalPartCount; partIndex++) {
      await client.importEvents({
        eventStoreId,
        partIndex,
      })

      importingBar.tick()
    }
  } finally {
    await deleteCsv(generatedFiles)
  }
}

export const handler = commandHandler(async ({ client }, params: any) => {
  const { path: eventStorePath, 'event-store-id': eventStoreId } = params

  logger.start(`importing the event-store to the cloud`)

  await importEventStore({
    client,
    eventStorePath,
    eventStoreId,
  })

  logger.success('Import event-store successfully completed!')
})

export const describe = chalk.green('import an event-store to the cloud')
export const command = 'import <event-store-id> <path>'
export const builder = (yargs: any) =>
  yargs
    .positional('event-store-id', {
      describe: chalk.green("an existing event store's id"),
      type: 'string',
    })
    .positional('path', {
      describe: chalk.green('path to the event-store directory'),
      type: 'string',
    })
