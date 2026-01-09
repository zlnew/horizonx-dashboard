import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import UserApi from '@/api/User'
import Permission from '@/constants/permission'
import useAuthStore from '@/stores/auth'

const useUserStore = defineStore('user', () => {
  const api = new UserApi()

  const users = ref<User[]>([])
  const meta = ref<Meta | null>(null)
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)
  const perPage = ref(10)
  const search = ref('')

  const selectedUser = ref<User | null>(null)

  const authStore = useAuthStore()
  const { can } = storeToRefs(authStore)

  const canReadMember = computed(() => can.value(Permission.MEMBER_READ))
  const canWriteMember = computed(() => can.value(Permission.MEMBER_WRITE))

  const getUsers = async (criteria: UserCriteria = {}) => {
    loading.value = true
    refetch.value = false
    notFound.value = false

    try {
      const res = await api.get<ApiResponse<User[]>>(criteria)

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
      return await api.store<ApiResponse>(request)
    } catch (error) {
      throw error
    }
  }

  const updateUser = async (resourceId: number, request = {}) => {
    try {
      return await api.update<ApiResponse>(resourceId, request)
    } catch (error) {
      throw error
    }
  }

  const deleteUser = async (resourceId: number) => {
    try {
      return await api.destroy<ApiResponse>(resourceId)
    } catch (error) {
      throw error
    }
  }

  const cleanupState = () => {
    users.value = []
    meta.value = null
    loading.value = false
    refetch.value = false
    notFound.value = false
    perPage.value = 10
    search.value = ''
    selectedUser.value = null
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
    canReadMember,
    canWriteMember,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    cleanupState
  }
})

export default useUserStore
