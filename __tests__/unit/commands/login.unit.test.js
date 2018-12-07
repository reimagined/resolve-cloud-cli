const inquirer = require('inquirer')

const login = jest.fn()

jest.doMock('../../../utils/auth', () => ({
  login
}))

inquirer.prompt.mockReturnValueOnce(Promise.resolve({ Username: 'John Smith', Password: 'qwerty' }))

const command = require('../../../commands/login')

describe('login command', () => {
  test('should update refresh token', async () => {
    await command()
    expect(inquirer.prompt).toBeCalledWith([
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
    expect(login).toBeCalledWith('John Smith', 'qwerty')
  })
})
