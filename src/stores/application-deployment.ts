import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'
import ApplicationDeploymentApi from '@/api/ApplicationDeployment'

const useApplicationDeploymentStore = defineStore('application-deployment', () => {
  const api = (appID: number) => new ApplicationDeploymentApi(appID)

  const deployments = ref<Deployment[]>([])
  const meta = ref<Meta | null>(null)
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)
  const perPage = ref(10)
  const search = ref('')

  const selectedDeployment = ref<Deployment | null>(null)

  const route = useRoute()
  const deploymentID = computed(() => Number(route.params.deploymentID))

  const getDeployments = async (appID: number, criteria: DeploymentCriteria = {}) => {
    loading.value = true
    refetch.value = false
    notFound.value = false

    try {
      const res = await api(appID).get<ApiResponse<Deployment[]>>(criteria)

      if (!res.data?.length) {
        notFound.value = true
      }

      deployments.value = res.data ?? []
      meta.value = res.meta ?? null
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const getRecentDeployments = async (appID: number) => {
    try {
      const res = await api(appID).get<ApiResponse<Deployment[]>>({ limit: 3 })
      return res.data
    } catch (error) {
      throw error
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
    meta.value = null
    loading.value = false
    refetch.value = false
    notFound.value = false
    perPage.value = 10
    search.value = ''
    selectedDeployment.value = null
  }

  return {
    deployments,
    meta,
    loading,
    refetch,
    notFound,
    perPage,
    selectedDeployment,
    deploymentID,
    getDeployments,
    getRecentDeployments,
    showDeployment,
    cleanupState
  }
})

export default useApplicationDeploymentStore
