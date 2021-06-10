import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'
import { HEADER_EXECUTION_MODE } from '../../constants'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId, domain } = params

  if (deploymentId == null) {
    return del(token, '/domains', { domain }, { [HEADER_EXECUTION_MODE]: 'async' })
  }

  return del(
    token,
    `/deployments/${deploymentId}/domain`,
    { domain },
    { [HEADER_EXECUTION_MODE]: 'async' }
  )
})

export const command = 'release <domain> [deployment-id]'
export const aliases = ['unbind']
export const describe = chalk.green('unbind domain for existing deployment')
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
