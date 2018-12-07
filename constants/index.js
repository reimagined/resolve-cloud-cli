const os = require('os')
const path = require('path')

const homeDir = os.homedir()

const ERRORS = require('./errorMessages')

module.exports = {
  SERVICE_URL: process.env.RESOLVE_CLOUD_HOST || 'https://api.resolve.sh',
  DEFAULT_CONFIG: 'cloud',
  ERRORS,
  CLOUD_CONFIG: {
    PATH: path.join(homeDir, '.resolve.json')
  },
  RESOLVE_CLIENT_ID: '743elq8as56v0vnen9j8np5ov3',
  RESOLVE_USER_POOL_ID: 'us-east-1_NPyyahLdT',
  JOB_STATUS_REQUEST_INTERVAL_MS: 3000
}
