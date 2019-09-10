const chalk = require('chalk')

module.exports = {
  command: 'certificates',
  aliases: ['certs'],
  describe: chalk.green('manage SSL certificates'),
  builder: yargs => yargs.commandDir('certificates')
}
