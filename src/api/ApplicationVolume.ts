import Api from './Api'

class ApplicationVolumeApi extends Api {
  constructor(applicationId: number) {
    super()
    this.resource = `applications/${applicationId}/volumes`
  }
}

export default ApplicationVolumeApi
