import Api from './Api'

class ApplicationEnvironment extends Api {
  constructor(applicationId: number) {
    super()
    this.resource = `applications/${applicationId}/env`
  }
}

export default ApplicationEnvironment
