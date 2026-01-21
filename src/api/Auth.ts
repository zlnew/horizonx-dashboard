import Api from './Api'

class AuthApi extends Api {
  public async user<T>() {
    const { data, error } = await this.fetch('auth/user').get().json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async login<T>(request = {}) {
    const { data, error } = await this.fetch('auth/login').post(request).json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async logout<T>() {
    const { error } = await this.fetch('auth/logout').post()

    return this.handleResponse<T>(null, error.value)
  }
}

export default AuthApi
