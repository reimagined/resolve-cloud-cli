import columnify from 'columnify'
import dateFormat from 'dateformat'
import isEmpty from 'lodash.isempty'
import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'

export const handler = refreshToken(async (token: any) => {
  const { result } = await get(token, `certificates`)
  if (result) {
    out(
      columnify(
        result.map((item: any) => {
          const {
            CertificateId,
            DomainName,
            AdditionalNames,
            Issuer,
            ImportedAt,
            NotBefore,
            NotAfter,
          } = item
          return {
            id: CertificateId,
            'domain name': DomainName,
            'additional names': isEmpty(AdditionalNames) ? 'N/A' : AdditionalNames.join(', '),
            issuer: Issuer,
            imported: ImportedAt ? dateFormat(new Date(ImportedAt), 'm/d/yy HH:MM:ss') : 'N/A',
            'not before': NotBefore ? dateFormat(new Date(NotBefore), 'm/d/yy HH:MM:ss') : 'N/A',
            'not after': NotAfter ? dateFormat(new Date(NotAfter), 'm/d/yy HH:MM:ss') : 'N/A',
          }
        }),
        {
          minWidth: 20,
          columns: [
            'id',
            'domain name',
            'additional names',
            'issuer',
            'imported',
            'not before',
            'not after',
          ],
          config: {
            'additional names': {
              maxWidth: 50,
            },
          },
        }
      )
    )
  }
})

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green('display a list of available certificates')
export const builder = () => {}
