import Api from './Api'

class ApplicationDeploymentApi extends Api {
  constructor(applicationId: number) {
    super()
    this.resource = `applications/${applicationId}/deployments`
  }
}

export default ApplicationDeploymentApi
