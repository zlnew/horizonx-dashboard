import { ref } from 'vue'
import { defineStore } from 'pinia'
import ApplicationEnvironmentApi from '@/api/ApplicationEnvironment'

const useApplicationEnvStore = defineStore('application-env', () => {
  const api = (appID: number) => new ApplicationEnvironmentApi(appID)

  const selectedEnvironment = ref<EnvironmentVariable | null>(null)

  const createEnvironment = async (appID: number, request = {}) => {
    try {
      return await api(appID).store<ApiResponse<EnvironmentVariable>>(request)
    } catch (error) {
      throw error
    }
  }

  const updateEnvironment = async (appID: number, envKey: string, request = {}) => {
    try {
      return await api(appID).update<ApiResponse<EnvironmentVariable>>(envKey, request)
    } catch (error) {
      throw error
    }
  }

  const deleteEnvironment = async (appID: number, envKey: string) => {
    try {
      return await api(appID).destroy<ApiResponse>(envKey)
    } catch (error) {
      throw error
    }
  }

  const cleanupState = () => {
    selectedEnvironment.value = null
  }

  return {
    selectedEnvironment,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    cleanupState
  }
})

export default useApplicationEnvStore
