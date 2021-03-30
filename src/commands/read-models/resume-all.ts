import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch, get } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deploymentId } = params

  const { result } = await get(token, `deployments/${deploymentId}/read-models`, {})

  const promises: Array<Promise<unknown>> = []
  const errors: Array<Error> = []
  for (const { name } of result) {
    promises.push(
      Promise.resolve()
        .then(() => patch(token, `deployments/${deploymentId}/read-models/${name}/resume`, {}))
        .catch((error) => errors.push(error))
    )
  }
  await Promise.all(promises)
  if (errors.length > 0) {
    const error = new Error(errors.map(({ message }) => message).join('\n'))
    error.stack = errors.map(({ stack }) => stack).join('\n')
    throw error
  }
})

export const command = 'resume-all <deployment-id>'
export const describe = chalk.green('resume updates for all read models')
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
