import Api from './Api'

class JobApi extends Api {
  protected resource = 'jobs'

  public async summary<T>() {
    const { data, error } = await this.fetch(`${this.resource}/summary`).get().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async retry<T>(jobID: number) {
    const { data, error } = await this.fetch(`${this.resource}/${jobID}/retry`).post().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default JobApi
