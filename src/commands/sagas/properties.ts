import chalk from 'chalk'

export const command = 'properties'
export const aliases = ['props']
export const describe = chalk.green('manage saga properties')
export const builder = (yargs: any) =>
  yargs.commandDir('properties', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
