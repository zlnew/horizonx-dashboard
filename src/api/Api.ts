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

  protected handleResponse<T>(
    data: T | null,
    error: { errors: Record<string, string[]> | null; message: string } | null,
  ) {
    if (error?.message) {
      throw new Error(error.message)
    }

    return data as T
  }
}
