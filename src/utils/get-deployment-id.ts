import * as config from '../config'
import { get } from '../api/client'

type Deployment = {
  deploymentId: string
  applicationName: string
  version: string
  eventStoreId: string
  domainName: string
}

const getDeploymentId = async (params: {
  token: string
  nameOverride?: string
  deploymentId?: string
}): Promise<string> => {
  const { nameOverride, deploymentId, token } = params
  let deployment: Deployment

  if (deploymentId == null) {
    const applicationName = config.getApplicationIdentifier(nameOverride)

    void ({ result: deployment } = await get(token, '/deployments', { applicationName }))

    if (deployment == null) {
      throw new Error(`Deployment ${applicationName} is not found`)
    }

    return deployment.deploymentId
  } else {
    return deploymentId
  }
}

export default getDeploymentId
