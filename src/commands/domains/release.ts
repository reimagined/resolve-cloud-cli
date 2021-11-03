import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, domain } = params

  if (deploymentId == null) {
    await client.releaseDomain({
      domain,
    })
    return
  }

  await client.unsetDeploymentDomain({
    deploymentId,
    domain,
  })
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
