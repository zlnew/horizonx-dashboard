import { ref } from 'vue'
import { defineStore } from 'pinia'
import UserApi from '@/api/User'

const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const meta = ref<Meta | null>(null)
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)
  const perPage = ref(20)
  const search = ref('')

  const selectedUser = ref<User | null>(null)

  const dialogCreateOpen = ref(false)
  const dialogUpdateOpen = ref(false)
  const dialogDeleteOpen = ref(false)

  const getUsers = async (criteria: Criteria) => {
    loading.value = true
    refetch.value = false
    notFound.value = false

    try {
      const res = await new UserApi().get<ApiResponse<User[]>>(criteria)

      if (!res.data?.length) {
        notFound.value = true
      }

      users.value = res.data ?? []
      meta.value = res.meta ?? null

      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const createUser = async (request = {}) => {
    try {
      return await new UserApi().store<ApiResponse>(request)
    } catch (error) {
      throw error
    }
  }

  const updateUser = async (resourceId: number, request = {}) => {
    try {
      return await new UserApi().update<ApiResponse>(resourceId, request)
    } catch (error) {
      throw error
    }
  }

  const deleteUser = async (resourceId: number) => {
    try {
      return await new UserApi().destroy<ApiResponse>(resourceId)
    } catch (error) {
      throw error
    }
  }

  return {
    users,
    meta,
    loading,
    refetch,
    notFound,
    perPage,
    search,
    selectedUser,
    dialogCreateOpen,
    dialogUpdateOpen,
    dialogDeleteOpen,
    getUsers,
    createUser,
    updateUser,
    deleteUser
  }
})

export default useUserStore
