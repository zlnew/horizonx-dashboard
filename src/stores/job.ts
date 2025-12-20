import { ref } from 'vue'
import { defineStore } from 'pinia'
import JobApi from '@/api/Job'

const useJobStore = defineStore('job', () => {
  const api = new JobApi()

  const jobs = ref<Job[]>([])
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)

  const selectedJob = ref<Job | null>(null)

  const getJobs = async () => {
    loading.value = true
    refetch.value = false
    notFound.value = false

    try {
      const res = await api.get<ApiResponse<Job[]>>()

      if (!res.data?.length) {
        notFound.value = true
      }

      jobs.value = res.data ?? []
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const showJob = async (jobID: number) => {
    try {
      const res = await api.show<ApiResponse<Job>>(jobID)
      return res.data
    } catch (error) {
      throw error
    }
  }

  const cleanupState = () => {
    jobs.value = []
    loading.value = false
    refetch.value = false
    notFound.value = false
    selectedJob.value = null
  }

  return {
    jobs,
    loading,
    refetch,
    notFound,
    selectedJob,
    getJobs,
    showJob,
    cleanupState
  }
})

export default useJobStore
