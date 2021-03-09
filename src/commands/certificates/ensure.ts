import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import { promisify } from 'util'

import refreshToken from '../../refreshToken'
import { put } from '../../api/client'
import { logger } from '../../utils/std'
import { HEADER_EXECUTION_MODE } from '../../constants'

const readFile = promisify(fs.readFile)

export const handler = refreshToken(async (token: any, params: any) => {
  const {
    'certificate-file': certificateFile,
    'key-file': keyFile,
    'chain-file': chainFile,
    id,
  } = params

  const [certificate, key, chain] = await Promise.all([
    readFile(path.join(__dirname, '..', '..', '..', certificateFile), 'utf8'),
    readFile(path.join(__dirname, '..', '..', '..', keyFile), 'utf8'),
    chainFile == null
      ? Promise.resolve(undefined)
      : readFile(path.join(__dirname, '..', '..', '..', chainFile), 'utf8'),
  ])

  const { result } = await put(
    token,
    `certificates`,
    {
      certificate,
      key,
      chain,
      id,
    },
    { [HEADER_EXECUTION_MODE]: 'async' }
  )

  logger.success(`The certificate "${result}" successfully ensured`)
})

export const command = 'ensure'
export const aliases = ['import', 'issue']
export const describe = chalk.green(
  'upload a new SSL certificate and print its id or replace an existing one by id'
)
export const builder = (yargs: any) =>
  yargs
    .option('certificate-file', {
      alias: 'crt',
      describe: 'a PEM-encoded file containing a certificate',
      type: 'string',
      demand: 'a certificate file is required',
    })
    .option('key-file', {
      alias: 'key',
      describe: "a PEM-encoded file containing a certificate's private key",
      type: 'string',
      demand: 'a certificate private key file is required',
    })
    .option('chain-file', {
      alias: 'chain',
      describe: 'a PEM-encoded file containing a certificate chain',
      type: 'string',
    })
    .option('id', {
      describe: "the certificate's identifier that you want to replace",
      type: 'string',
    })
    .group(['certificate-file', 'key-file', 'chain-file', 'id'], 'Options:')
