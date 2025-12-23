import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import ApplicationDeploymentApi from '@/api/ApplicationDeployment'

const useApplicationDeploymentStore = defineStore('application-deployment', () => {
  const api = (appID: number) => new ApplicationDeploymentApi(appID)

  const deployments = ref<Deployment[]>([])
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)

  const selectedDeployment = ref<Deployment | null>(null)

  const recentDeployments = computed(() => deployments.value.slice(0, 3))

  const getDeployments = async (appID: number) => {
    loading.value = true
    refetch.value = false
    notFound.value = false

    try {
      const res = await api(appID).get<ApiResponse<Deployment[]>>()

      if (!res.data?.length) {
        notFound.value = true
      }

      deployments.value = res.data ?? []
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const showDeployment = async (appID: number, deploymentID: number) => {
    try {
      const res = await api(appID).show<ApiResponse<Deployment>>(deploymentID)
      return res.data
    } catch (error) {
      throw error
    }
  }

  const cleanupState = () => {
    deployments.value = []
    loading.value = false
    refetch.value = false
    notFound.value = false
    selectedDeployment.value = null
  }

  return {
    deployments,
    loading,
    refetch,
    notFound,
    selectedDeployment,
    recentDeployments,
    getDeployments,
    showDeployment,
    cleanupState
  }
})

export default useApplicationDeploymentStore
