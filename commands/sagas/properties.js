const chalk = require('chalk')

module.exports = {
  command: 'properties',
  aliases: [ 'props' ],
  describe: chalk.green('manage saga properties'),
  builder: yargs => yargs.commandDir('properties'),
  handler: argv => {}

}
