const chalk = require('chalk')

module.exports = {
  command: 'sagas',
  describe: chalk.green('manage application sagas'),
  builder: yargs => yargs.commandDir('sagas')
}
