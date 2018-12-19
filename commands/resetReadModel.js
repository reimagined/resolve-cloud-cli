const log = require('consola')

const { resetReadModel } = require('../utils/api')

module.exports = async ({ name }, command) => {
  try {
    const output = await resetReadModel({
      app: { name },
      command
    })
    log.info(output)
  } catch (e) {
    log.error(e.message)
  }
}
