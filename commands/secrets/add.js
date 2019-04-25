const rc = require('rc')

exports.command = 'add [name] [value]'

exports.describe = 'adds s new secret variable to the deployment'

exports.builder = {}

exports.handler = () => {
  const conf = rc('resolve', {
    api_url: 'https://api.resolve.sh'
  })

  const refined = Object.entries(conf).reduce((obj, [key, value]) => {
    obj[key.toLowerCase()] = value

    return obj
  }, {})

  console.log(refined)
}
