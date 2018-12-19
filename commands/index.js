const deploy = require('./deploy')
const remove = require('./remove')
const login = require('./login')
const logs = require('./logs')
const addSecret = require('./addSecret')
const deleteSecret = require('./deleteSecret')
const deployments = require('./deployments')
const resetReadModel = require('./resetReadModel')

module.exports = {
  deploy,
  remove,
  login,
  logs,
  addSecret,
  deleteSecret,
  deployments,
  resetReadModel
}
