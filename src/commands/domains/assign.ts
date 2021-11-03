import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId, domain } = params

  await client.setDeploymentDomain({
    deploymentId,
    domain,
  })
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
