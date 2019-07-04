const chalk = require('chalk')

module.exports = {
  command: 'tracing',
  describe: chalk.green('manage application performance tracing'),
  builder: yargs => yargs.commandDir('tracing')
}
