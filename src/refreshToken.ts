import { refreshToken } from './api/auth'

const commandHandler = (handler: any) => async (...args: Array<any>) =>
  handler(await refreshToken(), ...args)

export default commandHandler
