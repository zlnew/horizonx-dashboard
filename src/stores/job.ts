import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'
import JobApi from '@/api/Job'

const useJobStore = defineStore('job', () => {
  const api = new JobApi()

  const jobs = ref<Job[]>([])
  const meta = ref<Meta | null>(null)
  const loading = ref(false)
  const refetch = ref(false)
  const notFound = ref(false)
  const perPage = ref(10)
  const search = ref('')

  const selectedJob = ref<Job | null>(null)

  const route = useRoute()
  const jobID = computed(() => Number(route.params.jobID))

  const getJobs = async (criteria: JobCriteria) => {
    loading.value = true
    refetch.value = false
    notFound.value = false

    try {
      const res = await api.get<ApiResponse<Job[]>>(criteria)

      if (!res.data?.length) {
        notFound.value = true
      }

      jobs.value = res.data ?? []
      meta.value = res.meta ?? null
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
    meta.value = null
    loading.value = false
    refetch.value = false
    notFound.value = false
    perPage.value = 10
    search.value = ''
    selectedJob.value = null
  }

  return {
    jobs,
    meta,
    loading,
    refetch,
    notFound,
    perPage,
    search,
    selectedJob,
    jobID,
    getJobs,
    showJob,
    cleanupState
  }
})

export default useJobStore
