const chalk = require('chalk')

module.exports = {
  command: 'secrets',
  describe: chalk.green('manage deployment secrets'),
  builder: yargs => yargs.commandDir('secrets')
}
