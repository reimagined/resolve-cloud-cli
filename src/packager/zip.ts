import fs from 'fs'
import archiver from 'archiver'

export default (path: any, name: any) => {
  const stream = fs.createWriteStream(name)
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })
  const result = new Promise((resolve, reject) => {
    archive.on('error', reject)
    stream.on('close', () => resolve(archive.pointer()))
  })
  archive.directory(path, false) // append files from a serverPath, putting its contents at the root of archive
  archive.pipe(stream)
  archive.finalize()
  return result
}
