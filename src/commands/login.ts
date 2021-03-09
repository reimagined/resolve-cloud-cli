// TODO: test
import inquirer from 'inquirer'
import chalk from 'chalk'
import { login } from '../api/auth'

export const handler = async () => {
  const { Username, Password } = await inquirer.prompt([
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

  await login(Username, Password)
}

export const command = 'login'
export const describe = chalk.green(
  'interactively authenticate and authorize in the reSolve cloud platform'
)
