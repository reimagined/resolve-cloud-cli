const log = require('consola')

const { addSecret } = require('../utils/api')

module.exports = async ({ name }, secret) => {
  try {
    const output = await addSecret({
      app: { name },
      secret
    })
    log.info(output)
  } catch (e) {
    log.error(e.message)
  }
}
