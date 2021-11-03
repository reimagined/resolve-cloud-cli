#!/usr/bin/env node
import yargs from 'yargs'
import chalk from 'chalk'

import middleware from './middleware'
import { logger } from './utils/std'

yargs
  .commandDir('commands', {
    extensions: ['js', 'ts'],
    exclude: /\.d\.ts/,
  })
  .completion('completion', chalk.green('generate bash completion script'))
  .middleware(middleware)
  .recommendCommands()
  .scriptName('resolve-cloud')
  .strict()
  .wrap(128)
  .demandCommand(1)
  .help()
  .showHelpOnFail(true)
  .usage(
    `\n${chalk.blue('$0')} <command> [sub-command] [arguments]\n${chalk.blue(
      '$0'
    )} <command> --help\n${chalk.blue('$0')} --version`
  )
  .option('help', { hidden: true })
  .option('version', { hidden: true, alias: 'v' })
  .option('verbosity', {
    describe: 'set output verbosity level',
    type: 'string',
    choices: ['silent', 'normal', 'debug', 'trace'],
  })
  .option('api-url', {
    describe: 'resolve api url',
    type: 'string',
  })
  .group(['verbosity', 'api-url'], 'Global options:')
  .fail((msg, err) => {
    if (msg) {
      logger.error(msg)
      process.exit(1)
    }
    if (err) {
      logger.error(err.stack)
      process.exit(1)
    }
  })
  .check((argv) => {
    for (const [key, value] of Object.entries(argv)) {
      if (typeof value === 'string' && value === '') {
        return `Invalid option "${key}" value`
      }
    }
    return true
  })
  .parse()
