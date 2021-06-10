import chalk from 'chalk'
import * as request from 'request'
import fs from 'fs'
import qr from 'qrcode-terminal'
import dotenv from 'dotenv'
import { intersectsVersions } from 'resolve-cloud-sdk'

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

  logger.trace(`requesting the list of existing deployments`)
  void ({ result: deployment } = await get(token, '/deployments', {
    applicationName,
  }))

  logger.trace(`deployment list received: ${deployment == null ? 0 : 1} items`)

  if (deployment == null) {
    logger.start(`deploying the "${applicationName}" application to the cloud`)

    if (receivedEventStoreId == null) {
      void ({
        result: { eventStoreId, eventStoreDatabaseName, eventBusLambdaArn },
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

      void ({ eventStoreId, eventStoreDatabaseName, eventBusLambdaArn } = foundEventStore)
    }

    const domains = domain == null ? [] : domain.split(',')

    const { result } = await post(
      token,
      `/deployments`,
      {
        applicationName,
        version: resolveVersion,
        eventStoreId,
        eventStoreDatabaseName,
        eventBusLambdaArn,
        domain: domains[0],
      },
      { [HEADER_EXECUTION_MODE]: 'async' }
    )

    const { deploymentId, domainName } = result

    if (domains.length > 0) {
      for (let index = 1; index < domains.length; index++) {
        await put(
          token,
          `/deployments/${deploymentId}/domain`,
          { domain: domains[index] },
          { [HEADER_EXECUTION_MODE]: 'async' }
        )
      }
    }

    deployment = {
      deploymentId,
      applicationName,
      version: resolveVersion,
      domainName,
      eventStoreId,
    }
  }

  if (!intersectsVersions(deployment.version, resolveVersion)) {
    throw new Error(
      `Current version "${resolveVersion}" incompatible with "${deployment.version}" deployment version`
    )
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

  if (envs != null) {
    await put(token, `deployments/${deployment.deploymentId}/environment`, {
      variables: dotenv.parse(Buffer.from(envs.join('\n'))),
    })
  }

  await patch(token, `/deployments/${deployment.deploymentId}/bootstrap`, undefined, {
    [HEADER_EXECUTION_MODE]: 'async',
  })

  const availableDomains = Array.from(
    new Set([...(domain == null ? [] : domain.split(',')), ...deployment.domainName.split(',')])
  )

  logger.success(
    `"${applicationName}" available at ${availableDomains
      .map((domainName) => `https://${domainName}`)
      .join(' ')}`
  )

  if (generateQrCode) {
    qr.generate(availableDomains[0], { small: true })
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
