import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import ServerApi from '@/api/Server'
import Permission from '@/constants/permission'
import useAuthStore from '@/stores/auth'

const useServerStore = defineStore('server', () => {
  const api = new ServerApi()

  const servers = ref<Server[]>([])
  const meta = ref<Meta | null>(null)
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)
  const perPage = ref(10)
  const search = ref('')

  const selectedServer = ref<Server | null>(null)

  const authStore = useAuthStore()
  const { can } = storeToRefs(authStore)

  const canReadServer = computed(() => can.value(Permission.SERVER_READ))
  const canWriteServer = computed(() => can.value(Permission.SERVER_WRITE))

  const getServers = async (criteria: ServerCriteria = {}) => {
    loading.value = true
    refetch.value = false
    notFound.value = false

    try {
      const res = await api.get<ApiResponse<Server[]>>(criteria)

      if (!res.data?.length) {
        notFound.value = true
      }

      servers.value = res.data ?? []
      meta.value = res.meta ?? null
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const registerServer = async (request = {}) => {
    try {
      return await api.store<ApiResponse>(request)
    } catch (error) {
      throw error
    }
  }

  const updateServer = async (resourceId: string, request = {}) => {
    try {
      return await api.update<ApiResponse>(resourceId, request)
    } catch (error) {
      throw error
    }
  }

  const deleteServer = async (resourceId: string) => {
    try {
      return await api.destroy<ApiResponse>(resourceId)
    } catch (error) {
      throw error
    }
  }

  const updateServerStatus = (status: EventServerStatusChanged) => {
    const idx = servers.value.findIndex((s) => s.id === status.server_id)
    if (idx != -1 && servers.value[idx]) {
      servers.value[idx].is_online = status.is_online
    }
  }

  const cleanupState = () => {
    servers.value = []
    meta.value = null
    loading.value = false
    refetch.value = false
    notFound.value = false
    perPage.value = 10
    search.value = ''
    selectedServer.value = null
  }

  return {
    servers,
    meta,
    loading,
    refetch,
    notFound,
    perPage,
    search,
    selectedServer,
    canReadServer,
    canWriteServer,
    getServers,
    registerServer,
    updateServer,
    deleteServer,
    updateServerStatus,
    cleanupState
  }
})

export default useServerStore
