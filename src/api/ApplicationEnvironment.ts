import Api from './Api'

class ApplicationEnvironmentApi extends Api {
  constructor(applicationId: number) {
    super()
    this.resource = `applications/${applicationId}/env`
  }
}

export default ApplicationEnvironmentApi
