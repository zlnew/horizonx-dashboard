<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ListChecksIcon, RotateCcwIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import JobStatusBadge from '@/components/JobStatusBadge.vue'
import RoutePagination from '@/components/RoutePagination.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import WSEvent from '@/constants/ws-event'
import JobStatus from '@/constants/job-status'
import { jobTypeLabel } from '@/mapper/job'
import useJobStore from '@/stores/job'

type Criteria = JobCriteria

const route = useRoute()
const { subscribe } = useWebSocket()
const jobStore = useJobStore()

const { jobs, meta, loading, notFound } = storeToRefs(jobStore)

const { formatDate } = useDate()

let jobSub: WSSubscribtion | null = null

const criteria = computed(() => route.query as Criteria)

const retrying = new Set<number>()

usePageMeta({
  title: 'Jobs',
  breadcrumb: [
    {
      label: 'Jobs',
      to: { name: 'jobs' }
    }
  ]
})

onMounted(() => {
  fetchJobs(criteria.value)

  // WS-driven live updates: status events patch the row in place; only a
  // genuinely new job (job_created) fetches that single record to prepend.
  // No full-page refetch on every event.
  jobSub = subscribe('jobs', async (msg) => {
    if (msg.event === WSEvent.JOB_STATUS_CHANGED) {
      const payload = msg.payload as EventJobStatusChanged
      jobStore.patchJobStatus(payload.job_id, payload.status)
      return
    }

    if (msg.event === WSEvent.JOB_STARTED) {
      const payload = msg.payload as EventJobStarted
      jobStore.patchJobStatus(payload.job_id, JobStatus.RUNNING)
      return
    }

    if (msg.event === WSEvent.JOB_FINISHED) {
      const payload = msg.payload as EventJobFinished
      jobStore.patchJobStatus(payload.job_id, payload.status)
      return
    }

    if (msg.event === WSEvent.JOB_CREATED) {
      const payload = msg.payload as EventJobCreated
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
  const criteria = to.query as Criteria
  fetchJobs(criteria)
})

onUnmounted(() => {
  jobSub?.unsubscribe()
  jobStore.cleanupState()
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

const canRetry = (job: Job) =>
  job.status === JobStatus.FAILED || job.status === JobStatus.EXPIRED

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
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent/50 border-border/50 rounded-xl border p-3">
          <ListChecksIcon
            :size="24"
            class="text-primary"
          />
        </div>
        <div class="border-border/50 flex flex-col gap-0 border-l pl-4">
          <h1 class="text-2xl font-black tracking-tight uppercase">Jobs</h1>
          <p class="text-muted-foreground text-sm font-medium italic">
            Control-plane job queue across all servers and applications
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-12">
    <Card>
      <CardContent class="p-0">
        <DataLoading v-if="loading" />
        <DataNotFound v-else-if="notFound" />

        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-16">ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Queued At</TableHead>
                <TableHead class="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="job in jobs" :key="job.id">
                <TableCell class="font-mono text-xs">
                  #{{ job.id }}
                </TableCell>
                <TableCell>{{ jobTypeLabel(job.type) }}</TableCell>
                <TableCell>
                  <JobStatusBadge :status="job.status" />
                </TableCell>
                <TableCell class="font-mono text-xs">
                  {{ job.server_id.slice(0, 8) }}…
                </TableCell>
                <TableCell>
                  {{ job.application_id ? `#${job.application_id}` : '—' }}
                </TableCell>
                <TableCell class="text-muted-foreground text-xs">
                  {{ formatDate(job.queued_at, 'DD-MM-YYYY HH:mm:ss') }}
                </TableCell>
                <TableCell class="text-right">
                  <Button
                    v-if="canRetry(job)"
                    size="sm"
                    variant="outline"
                    :disabled="retrying.has(job.id)"
                    @click="onRetry(job)"
                  >
                    <RotateCcwIcon
                      :size="14"
                      class="mr-1"
                    />
                    {{ retrying.has(job.id) ? 'Re-queueing…' : 'Retry' }}
                  </Button>
                  <span
                    v-else
                    class="text-muted-foreground text-xs"
                  >—</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div
          v-if="meta && meta.last_page > 1"
          class="border-border/50 border-t p-4"
        >
          <RoutePagination :meta="meta" />
        </div>
      </CardContent>
    </Card>
  </section>
</template>
