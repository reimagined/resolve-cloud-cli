const chalk = require('chalk')

exports.command = 'secrets'

exports.describe = chalk.green('manage deployment secrets')

exports.builder = yargs => yargs.commandDir('secrets')

exports.handler = argv => {}
