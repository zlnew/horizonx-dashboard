import Api from './Api'

class Auth extends Api {
  public async register<T>(request = {}) {
    const { data, error } = await this.fetch('auth/register').post(request).json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async login<T>(request = {}) {
    const { data, error } = await this.fetch('auth/login').post(request).json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default Auth
