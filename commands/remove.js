const log = require('consola')
const createSpinner = require('../utils/spinner')
const { waitJob, removeApp } = require('../utils/api')
const { DEFAULT_REGION, DEFAULT_STAGE } = require('../constants')

module.exports = async ({ name }, applicationName, opts) => {
  const spinner = createSpinner()
  try {
    const { region = DEFAULT_REGION, stage = DEFAULT_STAGE } = opts

    spinner.spin()
    log.debug(`\rEnqueuing app '${name}' removal`)

    const removeJob = await removeApp({
      name: applicationName || name,
      region,
      stage
    })
    log.debug(`\rWaiting for app '${name}' removal`)

    await waitJob(removeJob)
    log.success(`Application '${name}' removed successfully`)
  } catch (e) {
    if (e.response && e.response.status === 400) {
      log.error(e.response.data)
    } else {
      log.error(e.message)
    }
    return 1
  } finally {
    spinner.stop()
  }
  return 0
}
