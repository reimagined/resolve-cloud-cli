const chalk = require('chalk')

module.exports = {
  command: 'runtimes',
  describe: chalk.green('available runtimes information'),
  builder: yargs => yargs.commandDir('runtimes')
}
