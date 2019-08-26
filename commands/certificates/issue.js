const fs = require('fs')
const { promisify } = require('util')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { post } = require('../../api/client')

const readFile = promisify(fs.readFile)

const handler = refreshToken(
  async (token, { names, certificateFile, keyFile, chainFile, id = null }) => {
    const [certificate, key, chain] = await Promise.all([
      readFile(certificateFile, 'utf8'),
      readFile(keyFile, 'utf8'),
      readFile(chainFile, 'utf8')
    ])

    return post(token, `certificates`, {
      names,
      certificate,
      key,
      chain,
      id
    })
  }
)

module.exports = {
  handler,
  command: 'issue <names..>',
  aliases: ['import'],
  describe: chalk.green('issue a new SLL certificate for specified domain names'),
  builder: yargs =>
    yargs
      .positional('names', {
        describe: chalk.green('one or multiple CNAMEs to associate with a certificate'),
        type: 'string'
      })
      .option('certificateFile', {
        alias: 'crt',
        describe: 'a PEM-encoded file with a certificate',
        type: 'string',
        demand: 'a certificate file is required'
      })
      .option('keyFile', {
        alias: 'key',
        describe: "a PEM-encoded file with a certificate's private key",
        type: 'string',
        demand: 'a certificate private key file is required'
      })
      .option('chainFile', {
        alias: 'ca',
        describe: 'a PEM-encoded file with a certificate chain',
        type: 'string',
        demand: 'a certificate chain file is required'
      })
      .option('id', {
        describe: 'an identifier for a certificate',
        type: 'string'
      })
}
