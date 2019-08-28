const chalk = require('chalk')

module.exports = {
  command: 'aliases',
  describe: chalk.green('manage deployments aliases'),
  builder: yargs => yargs.commandDir('aliases')
}
