import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { put } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, domain } = params

  return put(token, `/deployments/${deploymentId}/domain`, { domain })
})

export const command = 'assign <domain> <deployment-id>'
export const aliases = ['bind']
export const describe = chalk.green('bind domain to the existing deployment')
export const builder = (yargs: any) =>
  yargs
    .positional('domain', {
      describe: chalk.green(
        'an existing custom domain name in fully qualified format (e.g. store.root-domain.org)'
      ),
      type: 'string',
    })
    .positional('deployment-id', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string',
    })
