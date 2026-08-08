<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { ListChecksIcon, RotateCcwIcon, SearchIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import JobQueueSummary from '@/components/JobQueueSummary.vue'
import JobStatusBadge from '@/components/JobStatusBadge.vue'
import PageHeader from '@/components/PageHeader.vue'
import RoutePagination from '@/components/RoutePagination.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useDate } from '@/composables/date'
import { usePageMeta } from '@/composables/page-meta'
import useWebSocket from '@/composables/web-socket'
import JobStatus from '@/constants/job-status'
import JobType from '@/constants/job-type'
import WSEvent from '@/constants/ws-event'
import { jobTypeLabel } from '@/mapper/job'
import useJobStore from '@/stores/job'

type Criteria = JobCriteria

const route = useRoute()
const router = useRouter()
const { subscribe } = useWebSocket()
const jobStore = useJobStore()

const { jobs, meta, loading, notFound } = storeToRefs(jobStore)

const { formatDate } = useDate()

let jobSub: WSSubscribtion | null = null

const search = ref('')
const statusFilter = ref<string | null>(null)
const typeFilter = ref<string | null>(null)
// Bumped (debounced 500ms) on job WS events; JobQueueSummary refetches on it.
const summaryTick = ref(0)
let summaryDebounce: ReturnType<typeof setTimeout> | null = null

const criteria = computed<Criteria>(() => ({ ...route.query }))

usePageMeta({
  title: 'Jobs',
  breadcrumb: [
    {
      label: 'Jobs',
      to: { name: 'jobs' }
    }
  ]
})

const bumpSummary = () => {
  if (summaryDebounce) {
    clearTimeout(summaryDebounce)
  }
  summaryDebounce = setTimeout(() => {
    summaryTick.value++
  }, 500)
}

onMounted(() => {
  fetchJobs(criteria.value)

  // WS-driven live updates: status events patch the row in place; only a
  // genuinely new job (job_created) fetches that single record to prepend.
  // No full-page refetch on every event.
  jobSub = subscribe('jobs', async (msg) => {
    if (msg.event === WSEvent.JOB_STATUS_CHANGED) {
      const payload = msg.payload as EventJobStatusChanged
      jobStore.patchJobStatus(payload.job_id, payload.status)
      bumpSummary()
      return
    }

    if (msg.event === WSEvent.JOB_STARTED) {
      const payload = msg.payload as EventJobStarted
      jobStore.patchJobStatus(payload.job_id, JobStatus.RUNNING)
      bumpSummary()
      return
    }

    if (msg.event === WSEvent.JOB_FINISHED) {
      const payload = msg.payload as EventJobFinished
      jobStore.patchJobStatus(payload.job_id, payload.status)
      bumpSummary()
      return
    }

    if (msg.event === WSEvent.JOB_CREATED) {
      const payload = msg.payload as EventJobCreated
      bumpSummary()
      try {
        const job = await jobStore.showJob(payload.job_id)
        if (job) {
          jobStore.upsertJob(job)
        }
      } catch {
        // Show failed; the row will appear on the next manual refetch.
      }
    }
  })
})

onBeforeRouteUpdate((to) => {
  const c = to.query as Criteria
  search.value = c.search ?? ''
  fetchJobs(c)
})

onUnmounted(() => {
  jobSub?.unsubscribe()
  jobStore.cleanupState()
  if (summaryDebounce) {
    clearTimeout(summaryDebounce)
  }
})

const fetchJobs = async (criteria: Criteria) => {
  try {
    await jobStore.getJobs({
      ...criteria,
      paginate: true,
      limit: 10
    })
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const applyFilters = useDebounceFn(() => {
  const q: Record<string, string> = {}
  if (search.value) q.search = search.value
  if (statusFilter.value) q.statuses = statusFilter.value
  if (typeFilter.value) q.job_type = typeFilter.value
  router.push({ query: q })
}, 300)

const clearFilters = () => {
  search.value = ''
  statusFilter.value = null
  typeFilter.value = null
  router.push({ query: {} })
}

const hasActiveFilters = computed(
  () => !!search.value || !!statusFilter.value || !!typeFilter.value
)

const onTypeFilter = (v: string) => {
  let value = ''

  if (v === 'all') {
    value = ''
  } else {
    value = v
  }

  typeFilter.value = value
  applyFilters()
}

const canRetry = (job: Job) => job.status === JobStatus.FAILED || job.status === JobStatus.EXPIRED

const retrying = new Set<number>()

const onRetry = async (job: Job) => {
  if (retrying.has(job.id)) {
    return
  }

  retrying.add(job.id)

  try {
    await jobStore.retryJob(job.id)
    toast.success(`Job #${job.id} re-queued`)
    fetchJobs(criteria.value)
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    retrying.delete(job.id)
  }
}

watch(
  () => route.query,
  (q) => {
    statusFilter.value = (q.statuses as string) ?? null
    typeFilter.value = (q.job_type as string) ?? null
  },
  { immediate: true }
)
</script>

<template>
  <section>
    <PageHeader
      :icon="ListChecksIcon"
      title="Jobs"
      description="Control-plane job queue across all servers and applications"
    >
      <template #actions>
        <JobQueueSummary
          :status="statusFilter"
          :tick="summaryTick"
        />
      </template>
    </PageHeader>
  </section>

  <section class="mt-12 space-y-4">
    <div class="flex flex-wrap-reverse items-center justify-between gap-4 sm:flex-wrap">
      <div class="flex-auto sm:flex-1">
        <InputGroup>
          <InputGroupInput
            v-model="search"
            placeholder="Search jobs&hellip;"
            @input="applyFilters"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Select
          :model-value="typeFilter ?? undefined"
          @update:model-value="(v) => onTypeFilter(String(v))"
        >
          <SelectTrigger class="w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem :value="JobType.APP_DEPLOY">Deploy</SelectItem>
            <SelectItem :value="JobType.APP_START">Start</SelectItem>
            <SelectItem :value="JobType.APP_STOP">Stop</SelectItem>
            <SelectItem :value="JobType.APP_RESTART">Restart</SelectItem>
            <SelectItem :value="JobType.APP_ROLLBACK">Rollback</SelectItem>
          </SelectContent>
        </Select>

        <Button
          v-if="hasActiveFilters"
          variant="outline"
          size="sm"
          @click="clearFilters"
        >
          Clear
        </Button>
      </div>
    </div>

    <template v-if="jobs.length">
      <Card>
        <CardContent class="p-0 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-16">ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Application</TableHead>
                <TableHead class="hidden md:table-cell"> Queued At </TableHead>
                <TableHead class="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="job in jobs"
                :key="job.id"
              >
                <TableCell class="font-mono text-xs"> #{{ job.id }} </TableCell>
                <TableCell>{{ jobTypeLabel(job.type) }}</TableCell>
                <TableCell>
                  <JobStatusBadge :status="job.status" />
                </TableCell>
                <TableCell>
                  <span
                    :title="job.server_id"
                    class="font-mono text-xs"
                  >
                    #{{ job.server_id }}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    :title="job.application_id != null ? `#${job.application_id}` : undefined"
                    class="font-mono text-xs"
                  >
                    #{{ job.application_id }}
                  </span>
                </TableCell>
                <TableCell class="text-muted-foreground hidden text-xs md:table-cell">
                  {{ formatDate(job.queued_at, 'DD-MM-YYYY HH:mm:ss') }}
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      v-if="canRetry(job)"
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      class="border-border/50 bg-accent/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30 rounded-lg border transition-all"
                      aria-label="Retry job"
                      :title="retrying.has(job.id) ? 'Re-queueing…' : 'Retry'"
                      :disabled="retrying.has(job.id)"
                      @click="onRetry(job)"
                    >
                      <RotateCcwIcon
                        :size="16"
                        :class="{ 'animate-spin': retrying.has(job.id) }"
                      />
                    </Button>
                    <span
                      v-else
                      class="text-muted-foreground text-xs"
                      >—</span
                    >
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoutePagination
        v-if="meta && meta.last_page > 1"
        :meta="meta"
      />
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else-if="notFound" />
  </section>
</template>
