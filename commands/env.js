const chalk = require('chalk')

module.exports = {
  command: 'environment',
  aliases: ['env'],
  describe: chalk.green('manage deployment environment variables'),
  builder: yargs => yargs.commandDir('env')
}
