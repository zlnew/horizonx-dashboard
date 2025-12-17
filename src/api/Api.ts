import { useFetch } from '@/composables/fetch'

const { fetch } = useFetch()

export default abstract class Api {
  protected fetch = fetch
  protected resource = ''

  public async get<T>(options = {}) {
    let url = this.resource

    const params = new URLSearchParams(options).toString()

    if (Object.keys(options).length) {
      url += `?${params}`
    }

    const { data, error } = await this.fetch(url).get().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async show<T>(resourceId: number | string) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}`).get().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async store<T>(options = {}) {
    const { data, error } = await this.fetch(this.resource).post(options).json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async update<T>(resourceId: number | string, options = {}) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}`)
      .put(options)
      .json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async destroy<T>(resourceId: number | string) {
    const { data, error } = await this.fetch(`${this.resource}/${resourceId}`).delete().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  protected handleResponse<T>(
    data: T | null,
    error: { errors: Record<string, string[]> | null; message: string } | null
  ) {
    if (error?.message) {
      throw new Error(error.message)
    }

    return data as T
  }
}
