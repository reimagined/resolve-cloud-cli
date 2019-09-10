const chalk = require('chalk')

module.exports = {
  command: 'aliases',
  describe: chalk.green('manage deployment aliases'),
  builder: yargs => yargs.commandDir('aliases')
}
