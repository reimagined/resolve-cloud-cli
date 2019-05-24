const { refreshToken } = require('./api/auth')

const commandHandler = handler => async (...args) => handler(await refreshToken(), ...args)

module.exports = commandHandler
