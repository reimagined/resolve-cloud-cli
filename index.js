#!/usr/bin/env node

const log = require('consola')
const yargs = require('yargs')
const chalk = require('chalk')

yargs
  .commandDir('commands')
  .completion('completion', chalk.green('generate bash completion script'))
  .recommendCommands()
  .scriptName('resolve-cloud')
  .strict()
  .wrap(yargs.terminalWidth())
  .demandCommand(1, '')
  .help()
  .showHelpOnFail(true)
  .usage(`\n${chalk.blue('$0')} <command> [subcommand] [arguments]\n${chalk.blue('$0')} <command> --help`)
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
