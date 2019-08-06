const chalk = require('chalk')

module.exports = {
  command: 'environment',
  aliases: ['env'],
  describe: chalk.green("manage a deployment's environment variables"),
  builder: yargs => yargs.commandDir('env')
}
