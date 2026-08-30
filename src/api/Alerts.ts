import Api from './Api'

type QueryValue = string | number | boolean | null | undefined

const buildQuery = (criteria: Record<string, QueryValue> = {}) => {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(criteria)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    params.append(key, String(value))
  }

  const query = params.toString()

  return query ? `?${query}` : ''
}

class AlertsApi extends Api {
  protected resource = 'alerts'

  public async listRules<T>(criteria: Record<string, QueryValue> = {}) {
    const { data, error } = await this.fetch(`${this.resource}/rules${buildQuery(criteria)}`)
      .get()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async showRule<T>(ruleId: number | string) {
    const { data, error } = await this.fetch(`${this.resource}/rules/${ruleId}`).get().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async storeRule<T>(request: CreateRuleRequest) {
    const { data, error } = await this.fetch(`${this.resource}/rules`).post(request).json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async updateRule<T>(ruleId: number | string, request: CreateRuleRequest) {
    const { data, error } = await this.fetch(`${this.resource}/rules/${ruleId}`)
      .put(request)
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async destroyRule<T>(ruleId: number | string) {
    const { data, error } = await this.fetch(`${this.resource}/rules/${ruleId}`).delete().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async activeAlerts<T>() {
    const { data, error } = await this.fetch(`${this.resource}/active`).get().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async alertHistory<T>(criteria: Record<string, QueryValue> = {}) {
    const { data, error } = await this.fetch(`${this.resource}/history${buildQuery(criteria)}`)
      .get()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async acknowledge<T>(alertId: number | string) {
    const { data, error } = await this.fetch(`${this.resource}/${alertId}/ack`)
      .post()
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async silenceRule<T>(ruleId: number | string, request: SilenceRequest) {
    const { data, error } = await this.fetch(`${this.resource}/${ruleId}/silence`)
      .post(request)
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default AlertsApi
