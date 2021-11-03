import inquirer from 'inquirer'
import chalk from 'chalk'

import { login } from '../api/auth'
import commandHandler from '../command-handler'

export const handler = commandHandler(async ({ client }, params: any) => {
  const { Username: username, Password: password } = await inquirer.prompt([
    {
      type: 'input',
      name: 'Username',
      message: 'Enter your email',
      filter: (input: string) => input.trim(),
    },
    {
      type: 'password',
      name: 'Password',
      message: 'Enter password',
      mask: '*',
    },
  ])

  const { clientId, userPoolId } = await client.getClientAppConfig()

  await login({
    userPoolId,
    clientId,
    username,
    password,
  })
})

export const command = 'login'
export const describe = chalk.green(
  'interactively authenticate and authorize in the reSolve cloud platform'
)
