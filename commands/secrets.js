const chalk = require('chalk')

exports.command = 'secrets <deployment-id>'

exports.describe = chalk.green('manage deployment secrets')

exports.builder = yargs => yargs.commandDir('secrets').demandCommand(1, '')

exports.handler = argv => {}
