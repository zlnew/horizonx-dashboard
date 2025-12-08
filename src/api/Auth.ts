import Api from './Api'

class AuthApi extends Api {
  public async register<T>(request = {}) {
    const { data, error } = await this.fetch('auth/register').post(request).json<T>()

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
