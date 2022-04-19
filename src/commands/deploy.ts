import chalk from 'chalk'
import fs from 'fs'
import qr from 'qrcode-terminal'
import dotenv from 'dotenv'
import { intersectsVersions, Deployment } from 'resolve-cloud-sdk'

import commandHandler from '../command-handler'
import packager, { codeZipPath, staticZipPath } from '../packager'
import * as config from '../config'
import { logger } from '../utils/std'
import fetch from '../utils/fetch'
import { importEventStore } from './event-stores/import'

export const handler = commandHandler(async ({ client }, params: any) => {
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

  let deployment: Deployment = null as any
  let eventStoreId: string = receivedEventStoreId as any

  logger.trace(`requesting the list of existing deployments`)

  const existingDeployment = await client.getDeploymentByApplicationName({ applicationName })
  if (existingDeployment != null) {
    deployment = existingDeployment
  }

  if (deployment == null) {
    logger.start(`deploying the "${applicationName}" application to the cloud`)

    if (receivedEventStoreId == null) {
      void ({ eventStoreId } = await client.createEventStore({
        version: resolveVersion,
      }))

      if (eventStorePath != null) {
        await importEventStore({
          client,
          eventStoreId,
          eventStorePath,
        })
      }
    }

    const domains = domain == null ? [] : domain.split(',')

    const createdDeployment = await client.createDeployment({
      applicationName,
      version: resolveVersion,
      eventStoreId,
      domain: domains[0],
    })

    for (let index = 1; index < domains.length; index++) {
      await client.setDeploymentDomain({
        deploymentId: createdDeployment.deploymentId,
        domain: domains[index],
      })
    }

    for (const item of createdDeployment.domains) {
      if (!domains.includes(item)) {
        domains.push(item)
      }
    }

    deployment = {
      deploymentId: createdDeployment.deploymentId,
      applicationName,
      version: resolveVersion,
      domains,
      eventStoreId,
    }
  } else if (receivedEventStoreId != null) {
    await client.linkDeployment({
      deploymentId: deployment.deploymentId,
      eventStoreId: receivedEventStoreId,
    })
  }

  if (!intersectsVersions(deployment.version, resolveVersion)) {
    throw new Error(
      'The minor version of reSolve in the application you are trying to deploy does not match the version used by the current cloud deployment. \n' +
        `Local: ${resolveVersion} \n` +
        `Deployed: ${deployment.version} \n` +
        'To upgrade to a new minor version, please create a new deployment.'
    )
  }

  const { codeUploadUrl, staticUploadUrl } = await client.getDeploymentUploadSignedUrl({
    deploymentId: deployment.deploymentId,
  })

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
          new Promise<void>(async (resolve, reject) => {
            const fileSizeInBytes = fs.lstatSync(zipPath).size
            const contentType = 'application/zip'
            const fileStream = fs.createReadStream(zipPath)
            try {
              await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                  'Content-Length': fileSizeInBytes.toString(),
                  'Content-Type': contentType,
                },
                body: fileStream,
              })

              resolve()
            } catch (error) {
              reject(error)
            }
          })
      )
    )
    logger.debug(`code.zip and static.zip have been uploaded`)
  } catch (error) {
    logger.debug(`failed to upload code.zip and static.zip`)
    throw error
  }

  await client.buildDeployment({
    deploymentId: deployment.deploymentId,
    npmRegistry,
  })

  if (envs != null) {
    await client.setEnvironmentVariables({
      deploymentId: deployment.deploymentId,
      variables: dotenv.parse(Buffer.from(envs.join('\n'))),
    })
  }

  await client.bootstrapDeployment({
    deploymentId: deployment.deploymentId,
  })

  const availableDomains = Array.from(
    new Set([...(domain == null ? [] : domain.split(',')), ...deployment.domains])
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
      alias: ['domains'],
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
