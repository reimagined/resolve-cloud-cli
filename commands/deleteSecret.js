const log = require('consola')

const { deleteSecret } = require('../utils/api')

module.exports = async ({ name }, secret) => {
  try {
    const output = await deleteSecret({
      app: { name },
      secret
    })
    log.info(output)
  } catch (e) {
    log.error(e.message)
  }
}
