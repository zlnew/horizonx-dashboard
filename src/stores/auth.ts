import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import AuthApi from '@/api/Auth'
import useWebSocket from '@/composables/web-socket'

const useAuthStore = defineStore('auth', () => {
  const api = new AuthApi()

  const user = useLocalStorage('horizonx_user', { name: '', email: '' } as User)
  const isAuthenticated = useLocalStorage('horizonx_authenticated', false)
  const { disconnect: disconnectWs } = useWebSocket()

  const loginError = ref<string | null>(null)

  const permissions = computed(() => user.value.permissions ?? [])

  const can = computed(() => {
    const owned = new Set(permissions.value.map((p) => p.name))

    return (permission: string | string[]) => {
      if (typeof permission === 'string') {
        return owned.has(permission)
      }

      return permission.every((p) => owned.has(p))
    }
  })

  const login = async (request: LoginRequest) => {
    loginError.value = null

    try {
      const { data } = await api.login<ApiResponse<User>>(request)
      user.value = data
      isAuthenticated.value = true
    } catch (error) {
      const fetchError = error as Error
      loginError.value = fetchError.message
      throw fetchError
    }
  }

  const logout = async () => {
    try {
      await api.logout()
      user.value = { name: '', email: '' } as User
      isAuthenticated.value = false
      disconnectWs()
    } catch (error) {
      const fetchError = error as Error
      throw fetchError
    }
  }

  return {
    user,
    isAuthenticated,
    loginError,
    permissions,
    can,
    login,
    logout
  }
})

export default useAuthStore
