jest.mock('../../../utils/api', () => ({
  saga: jest.fn()
}))

const { saga } = require('../../../utils/api')

const handler = require('../../../commands/saga')

describe('resetSaga', () => {
  test('executes correctly', async () => {
    await handler({ name: 'name-from-package-json', version: '0.0.1' }, 'reset', 'MySaga')
    expect(saga).toHaveBeenCalledWith({
      app: { name: 'name-from-package-json' },
      operation: 'reset',
      name: 'MySaga'
    })
  })
})

