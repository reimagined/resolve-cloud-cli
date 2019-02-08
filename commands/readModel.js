const log = require('consola')

const { readModel } = require('../utils/api')

module.exports = async ({ name: appName }, operation, name) => {
  try {
    const output = await readModel({
      app: { name: appName },
      operation,
      name
    })
    log.info(output)
  } catch (e) {
    log.error(e.message)
  }
}
