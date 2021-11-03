import chalk from 'chalk'

import commandHandler from '../../command-handler'
import { out } from '../../utils/std'

export const handler = commandHandler(async ({ client }) => {
  const versions = await client.listVersions()

  out(versions.join('\n'))
})

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green('display a list of the available runtimes')
export const builder = () => {}
