import latestVersion from 'latest-version'
import chalk from 'chalk'
import { gt } from 'semver'

import * as config from './config'
import { logger } from './utils/std'

const { version, name } = require('../package.json')

const verbosityLevels: Record<string, number> = {
  silent: -1,
  normal: 3,
  debug: 4,
  trace: 5,
}

const checkForUpdates = async () => {
  const availableVersion = await latestVersion(name)
  if (gt(availableVersion, version)) {
    logger.warn(
      chalk.yellowBright(
        `New version ${chalk.green(
          availableVersion
        )} of the package is available. It is highly recommended to upgrade.`
      )
    )
  }
}

const middleware = async (params: any) => {
  const { verbose, verbosity, apiUrl: apiUrlFromCLI } = params

  const actualVerbosity: any = verbosity || (verbose ? 'debug' : 'normal')
  logger.level = (verbosityLevels[actualVerbosity] || verbosityLevels.normal) as any

  const configApiUrl = config.get('api_url')

  const apiUrl =
    apiUrlFromCLI != null
      ? apiUrlFromCLI
      : process.env.RESOLVE_API_URL != null
      ? process.env.RESOLVE_API_URL
      : 'https://api.resolve.sh'

  if (configApiUrl !== apiUrl) {
    config.set('api_url', apiUrl)

    config.del('auth.client_id')
    config.del('auth.user_pool_id')
    config.del('credentials.token')
  }

  logger.trace(
    `Config: ${JSON.stringify(
      {
        api_url: config.get('api_url'),
        'auth.client_id': config.get('auth.client_id'),
        'auth.user_pool_id': config.get('auth.user_pool_id'),
      },
      null,
      2
    )}`
  )

  await checkForUpdates()
}

export default middleware
