import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'
import ApplicationApi from '@/api/Application'
import ApplicationStatus from '@/constants/application-status'

const useApplicationStore = defineStore('application', () => {
  const api = new ApplicationApi()

  const applications = ref<Application[]>([])
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)

  const selectedApplication = ref<Application | null>(null)

  const route = useRoute()
  const appID = computed(() => Number(route.params.id))

  const canUpdateApp = computed(() => {
    const validStates = [
      ApplicationStatus.RUNNING,
      ApplicationStatus.STOPPED,
      ApplicationStatus.FAILED,
      ApplicationStatus.UNKNOWN
    ]
    return validStates.includes(selectedApplication.value?.status ?? '')
  })

  const canDeleteApp = computed(() => {
    const validStates = [
      ApplicationStatus.RUNNING,
      ApplicationStatus.STOPPED,
      ApplicationStatus.FAILED,
      ApplicationStatus.UNKNOWN
    ]
    return validStates.includes(selectedApplication.value?.status ?? '')
  })

  const canDeployApp = computed(() => {
    const validStates = [
      ApplicationStatus.RUNNING,
      ApplicationStatus.STOPPED,
      ApplicationStatus.FAILED,
      ApplicationStatus.UNKNOWN
    ]
    return validStates.includes(selectedApplication.value?.status ?? '')
  })

  const canStartApp = computed(() => {
    const validStates = [ApplicationStatus.STOPPED]
    return validStates.includes(selectedApplication.value?.status ?? '')
  })

  const canStopApp = computed(() => {
    const validStates = [ApplicationStatus.RUNNING]
    return validStates.includes(selectedApplication.value?.status ?? '')
  })

  const canRestartApp = computed(() => {
    const validStates = [ApplicationStatus.RUNNING]
    return validStates.includes(selectedApplication.value?.status ?? '')
  })

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
      return await api.deploy<ApiResponse<Deployment>>(applicationID)
    } catch (error) {
      throw error
    }
  }

  const startApplication = async (applicationID: number) => {
    try {
      return await api.start<ApiResponse>(applicationID)
    } catch (error) {
      throw error
    }
  }

  const stopApplication = async (applicationID: number) => {
    try {
      return await api.stop<ApiResponse>(applicationID)
    } catch (error) {
      throw error
    }
  }

  const restartApplication = async (applicationID: number) => {
    try {
      return await api.restart<ApiResponse>(applicationID)
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
  }

  return {
    applications,
    loading,
    refetch,
    notFound,
    selectedApplication,
    appID,
    canUpdateApp,
    canDeleteApp,
    canDeployApp,
    canStartApp,
    canStopApp,
    canRestartApp,
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
