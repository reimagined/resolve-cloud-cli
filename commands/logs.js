const log = require('consola')

const { deploymentLogs } = require('../utils/api')

module.exports = async ({ name }, cmd) => {
  const { startTime, endTime, streamLimit, filterPattern } = cmd

  if (!name) {
    log.error('Please specify application name')
    return
  }

  try {
    const output = await deploymentLogs({
      applicationName: name,
      startTime,
      endTime,
      streamLimit,
      filterPattern
    })
    log.info(output)
  } catch (e) {
    log.error(e.message)
  }
}
