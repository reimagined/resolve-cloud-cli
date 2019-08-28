const chalk = require('chalk')

module.exports = {
  command: 'domains',
  describe: chalk.green('manage custom domains'),
  builder: yargs => yargs.commandDir('domains')
}
