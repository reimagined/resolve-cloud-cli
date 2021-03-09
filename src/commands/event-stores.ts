import chalk from 'chalk'

export const command = 'event-stores'
export const describe = chalk.green("manage user's event stores")
export const builder = (yargs: any) =>
  yargs.commandDir('event-stores', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
