/* eslint-disable no-underscore-dangle */
const fs = jest.genMockFromModule('fs')

let mockFiles = {}

function __setMockFiles(newMockFiles) {
  mockFiles = {}

  Object.keys(newMockFiles).forEach(key => {
    mockFiles[key] = newMockFiles[key]
  })
}

function __getMockFiles() {
  return mockFiles
}

function __clear() {
  mockFiles = {}
}

fs.__setMockFiles = __setMockFiles
fs.__getMockFiles = __getMockFiles
fs.__clear = __clear
/* eslint-enable no-underscore-dangle */

fs.readFile = (dir, _, cb) => {
  cb(null, mockFiles[dir])
}

fs.readFileSync = dir => mockFiles[dir]

fs.writeFile = (dir, file, __, cb) => {
  mockFiles[dir] = file
  cb(null)
}

fs.createReadStream = path => mockFiles[path]

module.exports = fs
