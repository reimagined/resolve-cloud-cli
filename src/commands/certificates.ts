import chalk from 'chalk'

export const command = 'certificates'
export const aliases = ['certs']
export const describe = chalk.green('manage SSL certificates')
export const builder = (yargs: any) =>
  yargs.commandDir('certificates', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
