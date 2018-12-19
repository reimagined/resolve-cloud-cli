jest.mock('../../../utils/api', () => ({
  resetReadModel: jest.fn()
}))

const { resetReadModel } = require('../../../utils/api')

const handler = require('../../../commands/resetReadModel')

describe('resetReadModel', () => {
  test('removing an app with default options', async () => {
    await handler({ name: 'name-from-package-json', version: '0.0.1' }, 'reset')
    expect(resetReadModel).toHaveBeenCalledWith({
      app: { name: 'name-from-package-json' },
      command: 'reset'
    })
  })
})
