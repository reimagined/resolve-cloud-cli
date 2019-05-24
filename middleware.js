const log = require('consola')

const middleware = ({ verbose }) => {
  log.level = verbose ? 5 : 1
}

module.exports = middleware
