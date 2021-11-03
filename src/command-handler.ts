import createCloudSdkClient, { ExtendedCloudSdk } from './api/client'

function commandHandler<Args extends Array<any>, Result>(
  handler: (context: { client: ExtendedCloudSdk }, ...args: Args) => Promise<Result>
) {
  return async (...args: Args): Promise<Result> => {
    const client = await createCloudSdkClient()
    return handler({ client }, ...args)
  }
}

export default commandHandler
