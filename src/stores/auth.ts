import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import AuthApi from '@/api/Auth'

const useAuthStore = defineStore('auth', () => {
  const user = useLocalStorage('horizonx_user', {} as User)
  const isAuthenticated = useLocalStorage('horizonx_authenticated', false)

  const loginError = ref<string | null>(null)
  const logoutError = ref<string | null>(null)
  const registerError = ref<string | null>(null)
  const registerSuccess = ref<string | null>(null)

  const register = async (request: RegisterRequest) => {
    registerError.value = null
    registerSuccess.value = null

    try {
      await new AuthApi().register<ApiResponse>(request)
      registerSuccess.value = 'Please login with your credentials'
    } catch (error) {
      const fetchError = error as Error
      registerError.value = fetchError.message
      throw fetchError
    }
  }

  const login = async (request: LoginRequest) => {
    loginError.value = null

    try {
      const { data } = await new AuthApi().login<ApiResponse<User>>(request)
      user.value = data
      isAuthenticated.value = true
    } catch (error) {
      const fetchError = error as Error
      loginError.value = fetchError.message
      throw fetchError
    }
  }

  const logout = async () => {
    logoutError.value = null

    try {
      await new AuthApi().logout()
      user.value = {} as User
      isAuthenticated.value = false
    } catch (error) {
      const fetchError = error as Error
      logoutError.value = fetchError.message
      throw fetchError
    }
  }

  return {
    user,
    isAuthenticated,
    registerError,
    registerSuccess,
    loginError,
    logoutError,
    register,
    login,
    logout
  }
})

export default useAuthStore
