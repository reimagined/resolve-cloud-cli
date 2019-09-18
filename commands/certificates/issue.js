const fs = require('fs')
const { promisify } = require('util')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const readFile = promisify(fs.readFile)

const handler = refreshToken(async (token, { certificateFile, keyFile, chainFile, id = null }) => {
  const [certificate, key, chain] = await Promise.all([
    readFile(certificateFile, 'utf8'),
    readFile(keyFile, 'utf8'),
    readFile(chainFile, 'utf8')
  ])

  return post(token, `certificates`, {
    certificate,
    key,
    chain,
    id
  })
})

module.exports = {
  handler,
  command: 'issue',
  aliases: ['import'],
  describe: chalk.green('issue a new SLL certificate for the specified domain names'),
  builder: yargs =>
    yargs
      .option('certificateFile', {
        alias: 'crt',
        describe: 'a PEM-encoded file containing a certificate',
        type: 'string',
        demand: 'a certificate file is required'
      })
      .option('keyFile', {
        alias: 'key',
        describe: "a PEM-encoded file containing a certificate's private key",
        type: 'string',
        demand: 'a certificate private key file is required'
      })
      .option('chainFile', {
        alias: 'ca',
        describe: 'a PEM-encoded file containing a certificate chain',
        type: 'string'
      })
      .option('id', {
        describe: "the certificate's identifier",
        type: 'string'
      })
}
