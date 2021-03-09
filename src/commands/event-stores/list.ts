import columnify from 'columnify'
import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'
import { getResolvePackageVersion } from '../../config'

export const handler = refreshToken(async (token: any) => {
  const version = getResolvePackageVersion()

  if (version == null) {
    throw new Error('Failed to get resolve package version')
  }

  const { result } = await get(token, `/event-stores`, {
    version,
  })

  if (result) {
    out(
      columnify(
        result.map(
          ({
            eventStoreId,
            version: esVersion,
            linkedDeployments,
          }: {
            eventStoreId: string
            version: string
            linkedDeployments: string
          }) => ({
            id: eventStoreId,
            version: esVersion,
            'linked deployments': linkedDeployments,
          })
        ),
        {
          minWidth: 20,
          truncate: true,
          columns: ['id', 'linked deployments', 'version'],
        }
      )
    )
  }
})

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green('display a list of event stores')
export const builder = () => {}
