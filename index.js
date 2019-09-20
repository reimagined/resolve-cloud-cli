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
  .wrap(128)
  .demandCommand(1, '')
  .help()
  .showHelpOnFail(true)
  .usage(
    `\n${chalk.blue('$0')} <command> [sub-command] [arguments]\n${chalk.blue(
      '$0'
    )} <command> --help\n${chalk.blue('$0')} --version`
  )
  .option('help', { hidden: true })
  .option('version', { hidden: true })
  .option('verbose', {
    describe: `${chalk.yellow('(deprecated)')} enable verbose output (same as --verbosity=debug)`,
    type: 'boolean',
    default: false
  })
  .option('verbosity', {
    describe: 'set output verbosity level',
    type: 'string',
    choices: ['silent', 'normal', 'debug', 'trace']
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
