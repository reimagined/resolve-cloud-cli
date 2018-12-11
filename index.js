#!/usr/bin/env node

const cli = require('commander')
const { version } = require('./package')

const { deploy, remove, login, logs, addSecret, deleteSecret, deployments } = require('./commands')
const { refreshToken } = require('./utils/auth')
const { getAppPackage } = require('./utils/config')

cli.version(version, '-v, --version')

cli
  .command('deploy')
  .option('-s, --stage [stage]', `The stage of the application will be deployed`)
  .option('-c, --config [config]', `Specify cloud config`)
  .option('--skip-build', 'Skip yarn build phase')
  .option('--eventstore [application eventstore name]', `Use existing application's eventstore`)
  .description('Deploy application to the resolve cloud')
  .action(async cmd => {
    const app = await getAppPackage()
    await refreshToken()
    await deploy(app, cmd)
  })

cli
  .command('remove')
  .option('-s, --stage [stage]', `The stage of the application to remove`)
  .description('Removes application deployment')
  .action(async cmd => {
    const app = await getAppPackage()
    await refreshToken()
    await remove(app, cmd)
  })

cli
  .command('logs')
  .option('--startTime [startTime]', 'A specific unit in time to start fetching logs from')
  .option('--endTime [endTime]', 'A specific unit in time to finish fetching logs at')
  .option('--filterPattern [filterPattern]', 'A filter pattern to search matchings with')
  .option('--streamLimit [streamLimit]', 'A number of streams to fetch logs from')
  .description('Prints function logs')
  .action(async cmd => {
    const app = await getAppPackage()
    await refreshToken()
    await logs(app, cmd)
  })

cli
  .command('add-secret <name> <value>')
  .description('Adds secret to the env variables')
  .action(async (name, value) => {
    const app = await getAppPackage()
    await refreshToken()
    await addSecret(app, { name, value })
  })

cli
  .command('delete-secret <name>')
  .description('Removes secret from the env variables')
  .action(async name => {
    const app = await getAppPackage()
    await refreshToken()
    await deleteSecret(app, { name })
  })

cli
  .command('deployments')
  .description('get user deployments list')
  .action(async () => {
    await getAppPackage()
    await refreshToken()
    await deployments()
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
