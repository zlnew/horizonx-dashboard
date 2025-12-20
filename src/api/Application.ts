import Api from './Api'

class ApplicationApi extends Api {
  protected resource = 'applications'

  public async deploy<T>(resourceId: number) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/deploy`)
      .get()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async start<T>(resourceId: number) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/start`)
      .post()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async stop<T>(resourceId: number) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/stop`).post().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async restart<T>(resourceId: number) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/restart`)
      .post()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default ApplicationApi
