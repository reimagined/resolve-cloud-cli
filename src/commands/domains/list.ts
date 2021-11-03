import columnify from 'columnify'
import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { out } from '../../utils/std'

export const handler = commandHandler(async ({ client }) => {
  const domains = await client.listDomains()

  out(
    columnify(
      domains.map(({ domainId, certificateId, verified, aliases, users, domainName }) => {
        return {
          'domain-id': domainId,
          'domain-name': domainName,
          'certificate-id': certificateId,
          verified,
          aliases: aliases.join(','),
          'users-access': Array.isArray(users) ? users.join(',') : users,
        }
      }),
      {
        minWidth: 10,
        truncate: true,
        columns: ['domain-id', 'aliases', 'verified', 'certificate-id', 'domain-name'],
      }
    )
  )
})

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green("display a list of the user's domains")
export const builder = () => {}
