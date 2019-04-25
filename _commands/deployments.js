const chalk = require('chalk')
const { deployments } = require('../utils/api')

module.exports = async () => {
  const format = deployment => `
  DeploymentId: ${chalk.bold.blue(deployment.deploymentId)}
  Application Name: ${chalk.bold.blue(deployment.applicationName)}
  Last Updated: ${chalk.bold.blue(deployment.lastUpdated)}
  URL: ${chalk.bold.blue(deployment.url.toLowerCase())}
  `
  try {
    const userDeployments = await deployments()
    if (!userDeployments.length) {
      console.info('No leased deployments found')
      return
    }
    console.info(
      [chalk.yellow(`  ======= Deployments =======`)]
        .concat(userDeployments.map(i => format(i)))
        .join('\n')
    )
  } catch (e) {
    console.error(e.message)
  }
}
