import Api from '@/api/Api'

class AccountApi extends Api {
  public async updateProfile<T>(request = {}) {
    const { data, error } = await this.fetch('account/profile').post(request).json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }

  public async changePassword<T>(request = {}) {
    const { data, error } = await this.fetch('account/password').post(request).json<T>()

    return this.handleResponse<T>(data.value, error.value)
  }
}

export default AccountApi
