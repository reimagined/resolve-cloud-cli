const chalk = require('chalk')

const { readModel } = require('../utils/api')

module.exports = async ({ name: appName }, operation, name) => {
  const format = readmodel => `
  ${readmodel}
  `
  try {
    const output = await readModel({
      app: { name: appName },
      operation,
      name
    })

    if (operation === 'list') {
      const readModels = JSON.parse(output.Payload)
      if (!readModels.length) {
        console.info('No read models found')
        return
      }
      console.info(
        [chalk.yellow(`  ======= Read models =======`)]
          .concat(readModels.map(i => format(i)))
          .join('\n')
      )
    } else {
      console.info(output.Payload || output)
    }
  } catch (e) {
    console.error(e.message)
  }
}
