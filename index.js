#!/usr/bin/env node

const log = require('consola')
const yargs = require('yargs')
const chalk = require('chalk')
const middleware = require('./middleware')

yargs
  .commandDir('commands')
  .completion('completion', chalk.green('generate bash completion script'))
  .middleware(middleware)
  .recommendCommands()
  .scriptName('resolve-cloud')
  .strict()
  .wrap(100)
  .demandCommand(1, '')
  .help()
  .showHelpOnFail(true)
  .usage(`\n${chalk.blue('$0')} <command> [subcommand] [arguments]\n${chalk.blue('$0')} <command> --help\n${chalk.blue('$0')} --version`)
  .option('help', { hidden: true })
  .option('version', { hidden: true })
  .option('verbose', {
    describe: 'enable verbose output',
    type: 'boolean',
    default: false
  })
  .fail((msg, err) => {
    if (msg) {
      log.error(msg)
    }
    if (err) {
      log.error(err.message)
    }
    process.exit(1)
  })
  .parse()
