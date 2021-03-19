import * as AWS from 'aws-sdk'

const setupCloudCredentials = (params: {
  accessKeyId?: string
  secretAccessKey?: string
  sessionToken?: string
}) => {
  const { accessKeyId, secretAccessKey, sessionToken } = params

  if (accessKeyId == null || accessKeyId === '') {
    throw new Error('Empty "accessKeyId"')
  }
  if (secretAccessKey == null || secretAccessKey === '') {
    throw new Error('Empty "secretAccessKey"')
  }
  if (sessionToken == null || sessionToken === '') {
    throw new Error('Empty "sessionToken"')
  }

  AWS.config.update({
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
  })

  process.env.AWS_ACCESS_KEY_ID = accessKeyId
  process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey
  process.env.AWS_SESSION_TOKEN = sessionToken
}

export default setupCloudCredentials
