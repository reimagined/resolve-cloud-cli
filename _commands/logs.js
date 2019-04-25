const log = require('consola')

const { deploymentLogs } = require('../utils/api')

module.exports = async ({ name }, applicationName, options) => {
  const { startTime, endTime, streamLimit, filterPattern } = options

  if (!name) {
    log.error('Please specify application name')
    return
  }

  try {
    const output = await deploymentLogs({
      applicationName: applicationName || name,
      startTime,
      endTime,
      streamLimit,
      filterPattern
    })
    log.info(output)
  } catch (e) {
    if (e.response && e.response.data) {
      log.error(e.response.data)
    } else {
      log.error(e.message)
    }
  }
}
