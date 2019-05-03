// TODO: test
const inquirer = require('inquirer')
const chalk = require('chalk')
const { login } = require('../api/auth')

const handler = async () => {
  const { Username, Password } = await inquirer.prompt([
    {
      type: 'input',
      name: 'Username',
      message: 'Enter your email'
    },
    {
      type: 'password',
      name: 'Password',
      message: 'Enter password',
      mask: '*'
    }
  ])

  await login(Username, Password)
}

module.exports = {
  handler,
  command: 'login',
  describe: chalk.green('interactively authenticate and authorize user')
}
