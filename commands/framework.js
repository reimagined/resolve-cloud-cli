const chalk = require('chalk')

module.exports = {
  command: 'framework',
  describe: chalk.red('[experimental] reSolve framework operations'),
  builder: yargs => yargs.commandDir('framework')
}
