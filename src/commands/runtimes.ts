import chalk from 'chalk'

export const command = 'runtimes'
export const describe = chalk.green('available runtimes information')
export const builder = (yargs: any) =>
  yargs.commandDir('runtimes', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
