import columnify from 'columnify'
import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'

export const handler = refreshToken(async (token: any) => {
  const { result } = await get(token, `domains`)
  if (result) {
    out(
      columnify(
        result.map((item: any) => {
          const { DomainId, CertificateId, Verified, Aliases, Users, DomainName } = item
          return {
            'domain-id': DomainId,
            'domain-name': DomainName,
            'certificate-id': CertificateId,
            verified: Verified,
            aliases: Aliases.join(','),
            'users-access': Array.isArray(Users) ? Users.join(',') : Users,
          }
        }),
        {
          minWidth: 10,
          truncate: true,
          columns: ['domain-id', 'aliases', 'verified', 'certificate-id', 'domain-name'],
        }
      )
    )
  }
})

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green("display a list of the user's domains")
export const builder = () => {}
