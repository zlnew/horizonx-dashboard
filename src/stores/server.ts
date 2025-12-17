import { ref } from 'vue'
import { defineStore } from 'pinia'
import ServerApi from '@/api/Server'

const useServerStore = defineStore('server', () => {
  const servers = ref<Server[]>([])
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)

  const selectedServer = ref<Server | null>(null)

  const dialogRegisterOpen = ref(false)
  const dialogUpdateOpen = ref(false)
  const dialogDeleteOpen = ref(false)

  const getServers = async () => {
    loading.value = true
    refetch.value = false
    notFound.value = false

    try {
      const res = await new ServerApi().get<ApiResponse<Server[]>>()

      if (!res.data?.length) {
        notFound.value = true
      }

      servers.value = res.data ?? []

      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const registerServer = async (request = {}) => {
    try {
      return await new ServerApi().store<ApiResponse>(request)
    } catch (error) {
      throw error
    }
  }

  const updateServer = async (resourceId: string, request = {}) => {
    try {
      return await new ServerApi().update<ApiResponse>(resourceId, request)
    } catch (error) {
      throw error
    }
  }

  const deleteServer = async (resourceId: string) => {
    try {
      return await new ServerApi().destroy<ApiResponse>(resourceId)
    } catch (error) {
      throw error
    }
  }

  const updateServerStatus = (status: ServerStatus) => {
    const idx = servers.value.findIndex((s) => s.id === status.server_id)
    if (idx != -1 && servers.value[idx]) {
      servers.value[idx].is_online = status.is_online
    }
  }

  const cleanupState = () => {
    servers.value = []
    loading.value = false
    refetch.value = false
    notFound.value = false
    selectedServer.value = null
    dialogRegisterOpen.value = false
    dialogUpdateOpen.value = false
    dialogDeleteOpen.value = false
  }

  return {
    servers,
    loading,
    refetch,
    notFound,
    selectedServer,
    dialogRegisterOpen,
    dialogUpdateOpen,
    dialogDeleteOpen,
    getServers,
    registerServer,
    updateServer,
    deleteServer,
    updateServerStatus,
    cleanupState
  }
})

export default useServerStore
