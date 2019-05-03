// TODO: tests
const chalk = require('chalk')

module.exports = {
  command: 'logs',
  describe: chalk.green('manage application logs'),
  builder: yargs => yargs.commandDir('logs')
}
