import Api from './Api'

class ApplicationApi extends Api {
  protected resource = 'applications'

  public async deploy<T>(resourceId: number) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/deploy`)
      .post()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async rollback<T>(resourceId: number) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/rollback`)
      .post()
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

  public async tailLogs<T>(resourceId: number, body?: LogsTailRequest) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/logs/tail`)
      .post(body ?? {})
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async stopTailLogs<T>(resourceId: number, streamId: string) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/logs/tail/stop`)
      .post({ stream_id: streamId })
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async queryLogs<T>(resourceId: number, body?: LogsQueryRequest) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/logs/query`)
      .post(body ?? {})
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default ApplicationApi
