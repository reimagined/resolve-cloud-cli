const dotenv = require('dotenv')
const chalk = require('chalk')
const { post } = require('../../api/client')
const refreshToken = require('../../refreshToken')

const handler = refreshToken(async (token, { deployment, variables }) =>
  post(token, `deployments/${deployment}/environment`, {
    variables: dotenv.parse(Buffer.from(variables.join('\n')))
  })
)

module.exports = {
  handler,
  command: `set <deployment> <variables...>`,
  describe: chalk.green('set an environment variable'),
  builder: yargs =>
    yargs
      .positional('deployment', {
        describe: chalk.green("an existing deployment's id"),
        type: 'string'
      })
      .positional('variables', {
        describe: chalk.green('a list of key=value pairs'),
        type: 'array'
      })
}
