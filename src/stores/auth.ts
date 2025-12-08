import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { toast } from 'vue-sonner'
import AuthApi from '@/api/Auth'

const useAuthStore = defineStore('auth', () => {
  const user = useLocalStorage('horizonx_user', {} as User)
  const isAuthenticated = useLocalStorage('horizonx_authenticated', false)

  const register = async (request: RegisterRequest) => {
    try {
      await new AuthApi().register(request)
    } catch (error) {
      const fetchError = error as Error
      toast.error(fetchError.message)
    }
  }

  const login = async (request: LoginRequest) => {
    try {
      const auth = await new AuthApi().login<User>(request)
      user.value = auth
      isAuthenticated.value = true
    } catch (error) {
      const fetchError = error as Error
      toast.error(fetchError.message)
    }
  }

  const logout = async () => {
    try {
      await new AuthApi().logout()
      user.value = {} as User
      isAuthenticated.value = false
    } catch (error) {
      const fetchError = error as Error
      toast.error(fetchError.message)
    }
  }

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout
  }
})

export default useAuthStore
