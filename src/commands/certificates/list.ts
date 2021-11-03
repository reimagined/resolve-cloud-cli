import columnify from 'columnify'
import dateFormat from 'dateformat'
import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { out } from '../../utils/std'

export const handler = commandHandler(async ({ client }) => {
  const result = await client.listCertificates()

  out(
    columnify(
      result.map((item) => {
        const {
          certificateId,
          domainName,
          additionalNames,
          issuer,
          importedAt,
          notBefore,
          notAfter,
        } = item
        return {
          id: certificateId,
          'domain name': domainName,
          'additional names': additionalNames.length === 0 ? 'N/A' : additionalNames.join(', '),
          issuer,
          imported: importedAt ? dateFormat(new Date(importedAt), 'm/d/yy HH:MM:ss') : 'N/A',
          'not before': notBefore ? dateFormat(new Date(notBefore), 'm/d/yy HH:MM:ss') : 'N/A',
          'not after': notAfter ? dateFormat(new Date(notAfter), 'm/d/yy HH:MM:ss') : 'N/A',
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
})

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green('display a list of available certificates')
export const builder = () => {}
