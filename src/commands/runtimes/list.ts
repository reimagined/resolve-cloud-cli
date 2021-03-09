import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'

export const handler = refreshToken(async (token: any) => {
  const { result } = await get(token, `runtimes`)

  if (result) {
    out(result.join('\n'))
  }
})

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green('display a list of the available runtimes')
export const builder = () => {}
