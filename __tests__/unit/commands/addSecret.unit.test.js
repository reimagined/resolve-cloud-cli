jest.mock('../../../utils/api', () => ({
  addSecret: jest.fn()
}))

const { addSecret } = require('../../../utils/api')

const handler = require('../../../commands/addSecret')

describe('add-secret', () => {
  test('removing an app with default options', async () => {
    await handler(
      { name: 'name-from-package-json', version: '0.0.1' },
      { name: 'SECRET-NAME', value: 'SECRET_VALUE' }
    )
    expect(addSecret).toHaveBeenCalledWith({
      app: { name: 'name-from-package-json' },
      secret: {
        name: 'SECRET-NAME',
        value: 'SECRET_VALUE'
      }
    })
  })
})
