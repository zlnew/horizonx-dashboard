import { ref } from 'vue'
import { defineStore } from 'pinia'
import ApplicationApi from '@/api/Application'

const useApplicationStore = defineStore('application', () => {
  const api = new ApplicationApi()

  const applications = ref<Application[]>([])
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)

  const selectedApplication = ref<Application | null>(null)

  const dialogUpdateAppOpen = ref(false)
  const dialogUpdateDockerComposeOpen = ref(false)
  const dialogCreateEnvVarOpen = ref(false)
  const dialogUpdateEnvVarOpen = ref(false)
  const dialogDeleteEnvVarOpen = ref(false)
  const dialogDeleteAppOpen = ref(false)

  const getApplications = async (criteria: ApplicationCriteria = {}) => {
    loading.value = true
    refetch.value = false
    notFound.value = false

    try {
      const res = await api.get<ApiResponse<Application[]>>(criteria)

      if (!res.data?.length) {
        notFound.value = true
      }

      applications.value = res.data ?? []
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const showApplication = async (applicationID: number) => {
    try {
      const res = await api.show<ApiResponse<Application>>(applicationID)
      return res.data
    } catch (error) {
      throw error
    }
  }

  const createApplication = async (request: ApplicationCreateRequest) => {
    try {
      return await api.store<ApiResponse<Application>>(request)
    } catch (error) {
      throw error
    }
  }

  const updateApplication = async (applicationID: number, request: ApplicationUpdateRequest) => {
    try {
      return await api.update<ApiResponse<Application>>(applicationID, request)
    } catch (error) {
      throw error
    }
  }

  const deleteApplication = async (applicationID: number) => {
    try {
      return await api.destroy<ApiResponse<Application>>(applicationID)
    } catch (error) {
      throw error
    }
  }

  const deployApplication = async (applicationID: number) => {
    try {
      return await api.deploy<ApiResponse<Application>>(applicationID)
    } catch (error) {
      throw error
    }
  }

  const startApplication = async (applicationID: number) => {
    try {
      return await api.start<ApiResponse<Application>>(applicationID)
    } catch (error) {
      throw error
    }
  }

  const stopApplication = async (applicationID: number) => {
    try {
      return await api.stop<ApiResponse<Application>>(applicationID)
    } catch (error) {
      throw error
    }
  }

  const restartApplication = async (applicationID: number) => {
    try {
      return await api.restart<ApiResponse<Application>>(applicationID)
    } catch (error) {
      throw error
    }
  }

  const cleanupState = () => {
    applications.value = []
    loading.value = false
    refetch.value = false
    notFound.value = false
    selectedApplication.value = null
    dialogUpdateAppOpen.value = false
    dialogUpdateDockerComposeOpen.value = false
    dialogCreateEnvVarOpen.value = false
    dialogUpdateEnvVarOpen.value = false
    dialogDeleteEnvVarOpen.value = false
    dialogDeleteAppOpen.value = false
  }

  return {
    applications,
    loading,
    refetch,
    notFound,
    selectedApplication,
    dialogUpdateAppOpen,
    dialogUpdateDockerComposeOpen,
    dialogCreateEnvVarOpen,
    dialogUpdateEnvVarOpen,
    dialogDeleteEnvVarOpen,
    dialogDeleteAppOpen,
    getApplications,
    showApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    deployApplication,
    startApplication,
    stopApplication,
    restartApplication,
    cleanupState
  }
})

export default useApplicationStore
