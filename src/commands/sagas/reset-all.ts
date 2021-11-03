import chalk from 'chalk'

import commandHandler from '../../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { deploymentId } = params

  const result = await client.listSagas({
    deploymentId,
  })

  const promises: Array<Promise<unknown>> = []
  const errors: Array<Error> = []
  for (const { name: sagaName } of result) {
    promises.push(
      Promise.resolve()
        .then(() =>
          client.resetSaga({
            deploymentId,
            sagaName,
          })
        )
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

export const command = 'reset-all <deployment-id>'
export const describe = chalk.green('reset the state of all sagas')
export const builder = (yargs: any) =>
  yargs.positional('deployment-id', {
    describe: chalk.green("an existing deployment's id"),
    type: 'string',
  })
