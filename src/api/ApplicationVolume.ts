import Api from './Api'

class ApplicationVolume extends Api {
  constructor(applicationId: number) {
    super()
    this.resource = `applications/${applicationId}/volumes`
  }
}

export default ApplicationVolume
