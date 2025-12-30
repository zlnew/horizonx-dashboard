import Api from './Api'

class ServerApi extends Api {
  protected resource = 'servers'

  public async getLatestMetrics<T>(resourceId: number | string) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}/metrics/latest`)
      .get()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async getCPUUsageHistory<T>(resourceId: number | string) {
    const { data, error } = await this.fetch(
      `${this.resource}/${resourceId}/metrics/cpu-usage-history`
    )
      .get()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async getNetSpeedHistory<T>(resourceId: number | string) {
    const { data, error } = await this.fetch(
      `${this.resource}/${resourceId}/metrics/net-speed-history`
    )
      .get()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default ServerApi
