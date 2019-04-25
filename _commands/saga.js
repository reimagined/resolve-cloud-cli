const chalk = require('chalk')

const { saga: requestSaga } = require('../utils/api')

module.exports = async ({ name: appName }, operation, name) => {
  const format = saga => {
    const payload = JSON.parse(saga.Payload)

    if (payload && payload.paused === true) {
      return `  ${saga.name}: paused`
    } else if (payload && payload.errorMessage) {
      return `  ${saga.name}: ${payload.errorMessage}`
    }
    return `  ${saga.name}`
  }
  try {
    const output = await requestSaga({
      app: { name: appName },
      operation,
      name
    })

    if (operation === 'list') {
      const sagas = JSON.parse(output.Payload)
      if (!sagas.length) {
        console.info('No sagas found')
        return
      }
      console.info(
        [chalk.yellow(`  ======= Sagas =======`)].concat(sagas.map(i => format(i))).join('\n')
      )
    } else {
      console.info(output.Payload || output)
    }
  } catch (e) {
    console.error(e.message)
  }
}
