const path = require('path')

module.exports = {
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.unit.test.[jt]s?(x)', '**/?(*.)+(spec|test).unit.test.[jt]s?(x)'],
  roots: [path.join(__dirname, 'src')],
}
