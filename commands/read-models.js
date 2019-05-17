const chalk = require('chalk')

module.exports = {
  command: 'read-models',
  describe: chalk.green('manage application read models'),
  builder: yargs => yargs.commandDir('read-models')
}
