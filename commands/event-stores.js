const chalk = require('chalk')

module.exports = {
  command: 'event-stores',
  describe: chalk.green("manage user's event stores"),
  builder: yargs => yargs.commandDir('event-stores')
}
