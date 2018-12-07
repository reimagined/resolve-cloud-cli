const log = require('consola')
const createSpinner = require('../utils/spinner')
const { waitJob, removeApp } = require('../utils/api')
const { DEFAULT_REGION, DEFAULT_STAGE } = require('../constants')

module.exports = async ({ name }, cmd) => {
  const spinner = createSpinner()
  try {
    const { region = DEFAULT_REGION, stage = DEFAULT_STAGE } = cmd

    spinner.spin()
    log.debug(`\rEnqueuing app '${name}' removal`)

    const removeJob = await removeApp({
      name,
      region,
      stage
    })
    log.debug(`\rWaiting for app '${name}' removal`)

    await waitJob(removeJob)
    log.success(`Application '${name}' removed successfully`)
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.error(error.response.data.message)
    } else {
      log.error(error.message)
    }
    return 1
  } finally {
    spinner.stop()
  }
  return 0
}
