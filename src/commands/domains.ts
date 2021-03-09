import chalk from 'chalk'

export const command = 'domains'
export const aliases = ['domain']
export const describe = chalk.green('manage custom domains')
export const builder = (yargs: any) =>
  yargs.commandDir('domains', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
