import chalk from 'chalk'

export const command = 'environment'
export const aliases = ['env']
export const describe = chalk.green("manage a deployment's environment variables")
export const builder = (yargs: any) =>
  yargs.commandDir('env', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
