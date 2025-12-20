import Api from './Api'

class ServerApi extends Api {
  protected resource = 'servers'

  public async getLatestMetrics<T>(resourceId: number | string) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/metrics/latest`)
      .get()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default ServerApi
