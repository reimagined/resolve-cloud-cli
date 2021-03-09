import fs from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'
import FormData from 'form-data'
import { post, get } from './client'

const upload = async (token: any, type: any, file: any, runtime: any) => {
  const key = nanoid()

  const query = [
    type != null ? `type=${type}` : null,
    key != null ? `key=${key}` : null,
    runtime != null ? `runtime=${runtime}` : null,
  ]
    .filter(Boolean)
    .join('&')

  const {
    result: { url, headers = {}, fields = {} },
  } = await get(token, `upload/url?${query}`)

  const form = new FormData()
  Object.keys(fields).forEach((field) => form.append(field, fields[field]))

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
    ...headers,
  })

  return key
}

export default upload
