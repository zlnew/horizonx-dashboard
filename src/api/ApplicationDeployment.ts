import Api from './Api'

class ApplicationDeploymentApi extends Api {
  constructor(applicationId: number) {
    super()
    this.resource = `applications/${applicationId}/deployments`
  }

  public async getDiff<T>(deploymentId: number) {
    const { data, error } = await this.fetch(`${this.resource}/${deploymentId}/diff`)
      .get()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default ApplicationDeploymentApi
