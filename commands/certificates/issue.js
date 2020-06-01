const fs = require('fs')
const { promisify } = require('util')
const isEmpty = require('lodash.isempty')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const readFile = promisify(fs.readFile)

const handler = refreshToken(
  async (
    token,
    { 'certificate-file': certificateFile, 'key-file': keyFile, 'chain-file': chainFile, id = null }
  ) => {
    const [certificate, key, chain] = await Promise.all([
      readFile(certificateFile, 'utf8'),
      readFile(keyFile, 'utf8'),
      isEmpty(chainFile) ? Promise.resolve(undefined) : readFile(chainFile, 'utf8')
    ])

    return post(token, `certificates`, {
      certificate,
      key,
      chain,
      id
    })
  }
)

module.exports = {
  handler,
  command: 'issue',
  aliases: ['import'],
  describe: chalk.green('issue a new SLL certificate for the specified domain names'),
  builder: yargs =>
    yargs
      .option('certificate-file', {
        alias: 'crt',
        describe: 'a PEM-encoded file containing a certificate',
        type: 'string',
        demand: 'a certificate file is required'
      })
      .option('key-file', {
        alias: 'key',
        describe: "a PEM-encoded file containing a certificate's private key",
        type: 'string',
        demand: 'a certificate private key file is required'
      })
      .option('chain-file', {
        alias: 'ca',
        describe: 'a PEM-encoded file containing a certificate chain',
        type: 'string'
      })
      .option('id', {
        describe: "the certificate's identifier",
        type: 'string'
      })
}
