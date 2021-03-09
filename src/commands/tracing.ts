import chalk from 'chalk'

export const command = 'tracing'
export const describe = chalk.green('manage application performance tracing')
export const builder = (yargs: any) =>
  yargs.commandDir('tracing', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
