#!/usr/bin/env node

const cli = require('commander')
const { version } = require('./package')

const {
  deploy,
  remove,
  login,
  logs,
  addSecret,
  deleteSecret,
  deployments,
  resetReadModel
} = require('./commands')
const { refreshToken } = require('./utils/auth')
const { getAppPackage } = require('./utils/config')

cli.version(version, '-v, --version')

cli
  .command('deploy')
  .option('-s, --stage [stage]', `The stage of the application to deploy`)
  .option('-c, --config [config]', `Specify cloud config`)
  .option('--skip-build', 'Skip yarn build phase')
  .option('--eventstore [application eventstore name]', `Use existing application's eventstore`)
  .option('--verbose', `verbose mode`)
  .description('Deploy application to the reSolve cloud')
  .action(async cmd => {
    const app = await getAppPackage()
    await refreshToken()
    await deploy(app, cmd)
  })

cli
  .command('remove [applicationName]')
  .option('-s, --stage [stage]', `The stage of the application to remove`)
  .description('Remove application deployment')
  .action(async (cmd, options) => {
    const app = await getAppPackage()
    await refreshToken()
    await remove(app, cmd, options)
  })

cli
  .command('logs [applicationName]')
  .option('--startTime [startTime]', 'A specific moment in time at which to start fetching logs')
  .option('--endTime [endTime]', 'A specific moment in time at which to finish fetching logs')
  .option('--filterPattern [filterPattern]', 'A filter pattern to use')
  .option('--streamLimit [streamLimit]', 'A number of streams used to fetch logs')
  .description('Print function logs')
  .action(async (cmd, options) => {
    const app = await getAppPackage()
    await refreshToken()
    await logs(app, cmd, options)
  })

cli
  .command('add-secret <name> <value>')
  .description('Add a secret to environment variables')
  .action(async (name, value) => {
    const app = await getAppPackage()
    await refreshToken()
    await addSecret(app, { name, value })
  })

cli
  .command('delete-secret <name>')
  .description('Remove a secret from environment variables')
  .action(async name => {
    const app = await getAppPackage()
    await refreshToken()
    await deleteSecret(app, { name })
  })

cli
  .command('deployments')
  .description('Get user deployments list')
  .action(async () => {
    await getAppPackage()
    await refreshToken()
    await deployments()
  })

cli
  .command('readmodel <command>')
  .description('reset application readmodel')
  .action(async command => {
    const app = await getAppPackage()
    await refreshToken()
    await resetReadModel(app, command)
  })

cli.command('login').action(login)

if (process.argv.length <= 2) {
  cli.help()
}

cli.parse(process.argv)

const exit = err => {
  console.error(err)
  process.exit(1)
}

process.on('uncaughtException', exit)
process.on('unhandledRejection', exit)
