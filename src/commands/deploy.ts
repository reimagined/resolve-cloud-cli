import chalk from 'chalk'
import * as request from 'request'
import fs from 'fs'
import qr from 'qrcode-terminal'
import dotenv from 'dotenv'

import { post, get, patch, put } from '../api/client'
import refreshToken from '../refreshToken'
import packager, { codeZipPath, staticZipPath } from '../packager'
import * as config from '../config'
import { logger } from '../utils/std'
import { importEventStore } from './event-stores/import'
import { HEADER_EXECUTION_MODE } from '../constants'

type Deployment = {
  deploymentId: string
  applicationName: string
  version: string
  eventStoreId: string
  domainName: string
}

export const handler = refreshToken(async (token: any, params: any) => {
  const resolveVersion = config.getResolvePackageVersion()

  const {
    'skip-build': skipBuild,
    configuration,
    name: nameOverride,
    'event-store-id': receivedEventStoreId,
    qr: generateQrCode,
    environment,
    'npm-registry': npmRegistry,
    domain,
    envs,
    'import-from': eventStorePath,
  } = params

  void environment
  const applicationName = config.getApplicationIdentifier(nameOverride)

  if (!skipBuild) {
    await packager(configuration, applicationName)
  } else {
    logger.trace(`skipping the application build phase`)
  }

  let deployment: Deployment
  let eventStoreId: string
  let eventStoreDatabaseName: string
  let eventBusLambdaArn: string
  let eventBusDatabaseName: string

  logger.trace(`requesting the list of existing deployments`)
  void ({ result: deployment } = await get(token, '/deployments', {
    applicationName,
    version: resolveVersion,
  }))

  logger.trace(`deployment list received: ${deployment == null ? 0 : 1} items`)

  if (deployment == null) {
    logger.start(`deploying the "${applicationName}" application to the cloud`)

    if (receivedEventStoreId == null) {
      void ({
        result: { eventStoreId, eventStoreDatabaseName, eventBusLambdaArn, eventBusDatabaseName },
      } = await post(
        token,
        `/event-stores`,
        { version: resolveVersion },
        { [HEADER_EXECUTION_MODE]: 'async' }
      ))

      if (eventStorePath != null) {
        await importEventStore({
          eventStoreId,
          eventStorePath,
        })
      }
    } else {
      const {
        result: listEventStores,
      }: {
        result: Array<{
          eventStoreId: string
          eventStoreDatabaseName: string
          eventBusLambdaArn: string
          eventBusDatabaseName: string
          version: string
        }>
      } = await get(token, `/event-stores`, {
        version: resolveVersion,
      })

      if (listEventStores == null) {
        throw new Error('Failed to get event store list')
      }

      const foundEventStore = listEventStores.find(
        ({ eventStoreId: foundEventStoreId }) => receivedEventStoreId === foundEventStoreId
      )

      if (foundEventStore == null) {
        throw new Error(`Event store with the "${receivedEventStoreId}" id was not found`)
      }

      if (foundEventStore.version !== resolveVersion) {
        throw new Error(
          `Wrong event store "${receivedEventStoreId}" version ${foundEventStore.version}`
        ) // TODO update message
      }

      void ({
        eventStoreId,
        eventStoreDatabaseName,
        eventBusLambdaArn,
        eventBusDatabaseName,
      } = foundEventStore)
    }

    const { result } = await post(
      token,
      `/deployments`,
      {
        applicationName,
        version: resolveVersion,
        eventStoreId,
        eventStoreDatabaseName,
        eventBusLambdaArn,
        eventBusDatabaseName,
        domain,
      },
      { [HEADER_EXECUTION_MODE]: 'async' }
    )

    const { deploymentId, domainName } = result

    if (envs != null) {
      await put(token, `deployments/${deploymentId}/environment`, {
        variables: dotenv.parse(Buffer.from(envs.join('\n'))),
      })
    }

    deployment = {
      deploymentId,
      applicationName,
      version: resolveVersion,
      domainName,
      eventStoreId,
    }
  }

  const {
    result: { codeUploadUrl, staticUploadUrl },
  } = await get(token, `/deployments/${deployment.deploymentId}/upload`, {})

  logger.debug(`upload code.zip and static.zip`)
  try {
    await Promise.all(
      [
        {
          zipPath: codeZipPath,
          uploadUrl: codeUploadUrl,
        },
        {
          zipPath: staticZipPath,
          uploadUrl: staticUploadUrl,
        },
      ].map(
        ({ zipPath, uploadUrl }) =>
          new Promise((resolve, reject) => {
            const fileSizeInBytes = fs.lstatSync(zipPath).size
            const contentType = 'application/zip'
            const fileStream = fs.createReadStream(zipPath)
            request.put(
              {
                uri: uploadUrl,
                headers: {
                  'Content-Length': fileSizeInBytes,
                  'Content-Type': contentType,
                },
                body: fileStream,
              },
              (error: Error, _: any, body: any) => {
                return error ? reject(error) : body ? reject(body) : resolve(body)
              }
            )
          })
      )
    )
    logger.debug(`code.zip and static.zip have been uploaded`)
  } catch (error) {
    logger.debug(`failed to upload code.zip and static.zip`)
    throw error
  }

  await patch(
    token,
    `/deployments/${deployment.deploymentId}/upload`,
    {
      npmRegistry,
    },
    { [HEADER_EXECUTION_MODE]: 'async' }
  )

  await patch(token, `/deployments/${deployment.deploymentId}/bootstrap`, undefined, {
    [HEADER_EXECUTION_MODE]: 'async',
  })

  const applicationUrl = `https://${deployment.domainName}`

  logger.success(`"${applicationName}" available at ${applicationUrl}`)

  if (generateQrCode) {
    qr.generate(applicationUrl, { small: true })
  }
})

export const aliases = undefined
export const command = 'deploy'
export const describe = chalk.green('deploy a reSolve application to the cloud')
export const builder = (yargs: any) =>
  yargs
    .option('skip-build', {
      describe: 'skip installing npm packages on the cloud',
      type: 'boolean',
      default: false,
    })
    .option('configuration', {
      alias: 'c',
      describe: 'the launch mode used to run the deployed application',
      type: 'string',
      default: 'cloud',
    })
    .option('name', {
      alias: 'n',
      describe: 'a unique name for the application, e.g. dev or prod',
      type: 'string',
    })
    .option('event-store-id', {
      alias: 'es',
      describe: `id of an existing event store to use in the the initial deployment`,
      type: 'string',
    })
    .option('qr', {
      describe: 'generate QR code containing the application URL',
      type: 'boolean',
      default: false,
    })
    .option('environment', {
      describe:
        'a list of key=value pairs that define environment variables for the running application',
      alias: ['env', 'envs'],
      type: 'array',
    })
    .option('npm-registry', {
      describe: 'a custom NPM registry URL',
      type: 'string',
      deprecated: true,
    })
    .option('domain', {
      describe: 'a verified domain to which to bind the deployed application',
      type: 'string',
    })
    .option('import-from', {
      describe: 'a path to the event store directory',
      type: 'string',
    })
    .conflicts('event-store-id', 'import-from')
    .group(
      [
        'skip-build',
        'configuration',
        'name',
        'event-store-id',
        'qr',
        'environment',
        'npm-registry',
        'domain',
        'import-from',
      ],
      'Options:'
    )
