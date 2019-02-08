jest.mock('../../../utils/api', () => ({
  readModel: jest.fn()
}))

const { readModel } = require('../../../utils/api')

const handler = require('../../../commands/readModel')

describe('resetReadModel', () => {
  test('removing an app with default options', async () => {
    await handler({ name: 'name-from-package-json', version: '0.0.1' }, 'reset', 'MyReadModel')
    expect(readModel).toHaveBeenCalledWith({
      app: { name: 'name-from-package-json' },
      operation: 'reset',
      name: 'MyReadModel'
    })
  })
})
