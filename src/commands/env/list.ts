import columnify from 'columnify'
import chalk from 'chalk'

import { get } from '../../api/client'
import { out } from '../../utils/std'
import refreshToken from '../../refreshToken'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId } = params

  const { result } = await get(token, `deployments/${deploymentId}/environment`)

  out(
    columnify(result, {
      columnSplitter: '    ',
    })
  )
})

export const command = `list <deployment-id>`
export const describe = chalk.green('display a list of environment variables')
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
