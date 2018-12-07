const fs = require('fs')
const path = require('path')
const log = require('consola')
const createSpinner = require('../utils/spinner')
const packager = require('../packager')
const FormData = require('form-data')
const qr = require('qrcode-terminal')

const { DEFAULT_CONFIG } = require('../constants')
const { upload, requestDeploy, commitDeploy, waitJob } = require('../utils/api')
const { validateSubdomainName } = require('../utils/verification')

log.level = 5

module.exports = async (
  { name, version },
  { config = DEFAULT_CONFIG, eventstore = undefined, skipBuild = false }
) => {
  try {
    const start = Date.now()

    const validationErrors = validateSubdomainName(name)

    if (validationErrors.length > 0) {
      log.error(validationErrors)
      return 1
    }

    const { deploymentId } = await requestDeploy({
      app: {
        name,
        version,
        eventstore
      }
    })

    log.debug(`available deploymentId: ${deploymentId}`)

    if (!skipBuild) {
      try {
        // build, install, zip
        await packager(config, deploymentId)
      } catch (e) {
        log.error(e)
        return 1
      }
    }

    const spinner = createSpinner()

    try {
      spinner.spin()

      const codePayload = new FormData({})
      codePayload.append('file', fs.createReadStream(path.resolve('code.zip')))
      const staticPayload = new FormData({})
      staticPayload.append('file', fs.createReadStream(path.resolve('static.zip')))

      const [{ id: uploadCodeId }, { id: uploadStaticId }] = await Promise.all([
        upload(codePayload),
        upload(staticPayload)
      ])

      const { jobId } = await commitDeploy({
        app: {
          name,
          version,
          eventstore
        },
        deploymentId,
        codeLocation: uploadCodeId,
        staticLocation: uploadStaticId
      })

      const url = await waitJob({ jobId, deploymentId })

      const duration = Math.round((Date.now() - start) / 1000)

      log.info('\n')
      qr.generate(url, { small: true })
      log.success(`\rBuild time ${duration} sec. Your app now available at: ${url}`)
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log.error(error.response.data)
      } else {
        log.error(error)
      }
    } finally {
      spinner.stop()
    }
  } catch (e) {
    log.error(e)
  }
  return 0
}
