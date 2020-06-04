const fs = require('fs')
const path = require('path')
const nanoid = require('nanoid')
const FormData = require('form-data')
const { post, get } = require('../api/client')

const upload = async (token, type, file) => {
  const key = nanoid()
  const {
    result: { url, headers = {}, fields = {} }
  } = await get(token, `upload/url?type=${type}&key=${key}`)

  const form = new FormData()
  Object.keys(fields).forEach(field => form.append(field, fields[field]))

  form.append('file', fs.createReadStream(path.resolve(file)))

  const contentLength = await new Promise((resolve, reject) =>
    form.getLength((err, length) => {
      if (err) {
        return reject(err)
      }
      return resolve(length)
    })
  )

  await post(null, url, form, {
    'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
    'Content-Length': contentLength,
    ...headers
  })

  return key
}

module.exports = upload
