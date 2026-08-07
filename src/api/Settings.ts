import Api from './Api'

export type WebhookSettings = {
  enabled: boolean
  url: string
  secret: string
}

export type WebhookTestResult = {
  status: number
  message: string
}

class SettingsApi extends Api {
  protected resource = 'settings/webhook'

  public async getWebhook<T>() {
    const { data, error } = await this.fetch(this.resource).get().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async updateWebhook<T>(request = {}) {
    const { data, error } = await this.fetch(this.resource).put(request).json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async testWebhook<T>() {
    const { data, error } = await this.fetch(`${this.resource}/test`).post().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default SettingsApi
