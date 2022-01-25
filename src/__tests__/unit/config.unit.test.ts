import fs from 'fs'
import { mocked } from 'jest-mock'

import { getResolvePackageVersion } from '../../config'

jest.mock('fs', () => ({
  readFileSync: jest.fn(() =>
    JSON.stringify({
      dependencies: {
        '@resolve-js/package-1': '0.0.0',
        '@resolve-js/package-2': '0.0.0',
      },
    })
  ),
}))

afterEach(() => {
  mocked(fs.readFileSync).mockClear()
})

test('should failed with wrong package.json', async () => {
  mocked(fs.readFileSync).mockReturnValueOnce('')

  expect(getResolvePackageVersion).toThrowError('Failed to read "package.json" file.')
})

test('should failed with not the same resolve version', async () => {
  mocked(fs.readFileSync).mockReturnValueOnce(
    JSON.stringify({
      dependencies: {
        '@resolve-js/package-1': '0.1.0',
        '@resolve-js/package-2': '0.2.0',
      },
    })
  )

  expect(getResolvePackageVersion).toThrowError(
    'The resolve package versions must be the same ["@resolve-js/package-1", "@resolve-js/package-2"]'
  )
})

test('should return 0.0.0 version', async () => {
  const result = getResolvePackageVersion()

  expect(result).toEqual('0.0.0')
})

test('support future scoped packages', async () => {
  mocked(fs.readFileSync).mockReturnValueOnce(
    JSON.stringify({
      dependencies: {
        '@resolve-js/package-1': '0.1.0',
      },
    })
  )

  expect(getResolvePackageVersion()).toEqual('0.1.0')
})
