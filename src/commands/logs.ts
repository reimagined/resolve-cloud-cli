import chalk from 'chalk'

export const command = 'logs'
export const describe = chalk.green('manage application logs')
export const builder = (yargs: any) =>
  yargs.commandDir('logs', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
