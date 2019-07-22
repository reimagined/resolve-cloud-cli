const log = require('consola')

const middleware = ({ verbose }) => {
  log.level = verbose ? 5 : 3
}

module.exports = middleware
