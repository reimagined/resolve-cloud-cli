jest.mock('../../../utils/api', () => ({
  deleteSecret: jest.fn()
}))

const { deleteSecret } = require('../../../utils/api')

const handler = require('../../../commands/deleteSecret')

describe('delete-secret', () => {
  test('removing an app with default options', async () => {
    await handler({ name: 'name-from-package-json', version: '0.0.1' }, { name: 'SECRET-NAME' })
    expect(deleteSecret).toHaveBeenCalledWith({
      app: { name: 'name-from-package-json' },
      secret: {
        name: 'SECRET-NAME'
      }
    })
  })
})
