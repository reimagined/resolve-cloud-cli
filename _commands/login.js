const inquirer = require('inquirer')
const { login } = require('../utils/auth')

module.exports = async () => {
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
