import chalk from 'chalk'

export const command = 'sagas'
export const describe = chalk.green("manage an application's sagas")
export const builder = (yargs: any) =>
  yargs.commandDir('sagas', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
