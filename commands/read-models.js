const chalk = require('chalk')

module.exports = {
  command: 'read-models',
  describe: chalk.green("manage an application's read models"),
  builder: yargs => yargs.commandDir('read-models')
}
