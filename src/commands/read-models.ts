import chalk from 'chalk'

export const command = 'read-models'
export const describe = chalk.green("manage an application's read models")
export const builder = (yargs: any) =>
  yargs.commandDir('read-models', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
