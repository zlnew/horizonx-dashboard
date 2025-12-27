<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useClipboard } from '@vueuse/core'
import { CheckIcon, ClipboardIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppDeployBadge from '@/components/AppDeployBadge.vue'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useDate } from '@/composables/date'
import { defineBreadcrumbs, usePageMeta } from '@/composables/page-meta'
import useWebSocket from '@/composables/web-socket'
import JobStatus from '@/constants/job-status'
import WSEvent from '@/constants/ws-event'
import { jobTypeLabel } from '@/mapper/job'
import { logLevelLabel } from '@/mapper/log'
import useApplicationStore from '@/stores/application'
import useJobStore from '@/stores/job'

const { subscribe } = useWebSocket()
const { formatDate, formatDuration } = useDate()
const applicationStore = useApplicationStore()
const jobStore = useJobStore()

const { selectedApplication: application, appID } = storeToRefs(applicationStore)
const { selectedJob: job, jobID } = storeToRefs(jobStore)
const logsContainer = ref<HTMLElement | null>(null)
const loading = ref(false)

let jobSub: { unsubscribe: () => void }
let logSub: { unsubscribe: () => void }

usePageMeta({
  title: 'Details',
  breadcrumb: computed(() =>
    defineBreadcrumbs([
      {
        label: 'Applications',
        to: { name: 'applications' }
      },
      {
        label: `${application.value?.name} · Activities`,
        to: {
          name: 'applications.activities',
          params: { id: appID.value.toString() }
        }
      },
      {
        label: 'Details',
        to: {
          name: 'applications.activities.show',
          params: { id: appID.value.toString(), deploymentID: jobID.value.toString() }
        }
      }
    ])
  )
})

const { copy: copyLogs, copied: copiedLogs } = useClipboard()

watch(copiedLogs, (copied) => {
  if (copied) {
    toast.success('Logs copied!')
  }
})

watch(
  () => job.value?.logs?.length,
  async () => {
    await nextTick()
    if (!logsContainer.value) return

    logsContainer.value.scrollTop = logsContainer.value.scrollHeight
  }
)

onMounted(() => {
  fetchJob(jobID.value)
})

onBeforeRouteUpdate((to) => {
  const jobID = Number(to.params.jobID)
  fetchJob(jobID)
})

onUnmounted(() => {
  jobSub?.unsubscribe()
  logSub?.unsubscribe()
  jobStore.selectedJob = null
})

const fetchJob = async (jobID: number) => {
  loading.value = true

  try {
    const res = await jobStore.showJob(jobID)
    job.value = res ?? null
    listenJobEvents()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    loading.value = false
  }
}

const listenJobEvents = () => {
  const validStatus = [JobStatus.QUEUED, JobStatus.RUNNING]
  if (!job.value?.id || !validStatus.includes(job.value.status)) {
    return
  }

  jobSub = subscribe(`job:${job.value.id}`, (msg) => {
    if (!job.value) {
      return
    }

    if (msg.event === WSEvent.JOB_STATUS_CHANGED) {
      const payload = msg.payload as EventJobStatusChanged
      job.value.status = payload.status
      return
    }

    if (msg.event === WSEvent.JOB_FINISHED) {
      const payload = msg.payload as EventJobFinished
      fetchJob(payload.job_id)

      jobSub?.unsubscribe()
      logSub?.unsubscribe()

      return
    }
  })

  logSub = subscribe('logs', (msg) => {
    if (!job.value) {
      return
    }

    if (msg.event === WSEvent.LOG_RECEIVED) {
      const payload = msg.payload as EventLogReceived
      if (payload.job_id === job.value.id) {
        if (!job.value.logs?.length) {
          job.value.logs = []
        }
        job.value.logs.push(payload)
      }
      return
    }
  })
}

const handleLogsCopy = (copy: (text: string) => Promise<void>) => {
  const logs = job.value?.logs?.map((l) => l.context?.line ?? '') ?? []
  copy(logs.join('\n'))
}
</script>

<template>
  <template v-if="job">
    <section class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
          <CardDescription>
            <div class="flex flex-wrap items-center gap-1 text-neutral-400">
              <span class="font-bold">{{ jobTypeLabel(job.type) }}</span>
              <span>&middot;</span>
              <span>
                {{
                  job.queued_at ? formatDate(new Date(job.queued_at), 'DD MMM, YYYY HH:mm') : '-'
                }}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div class="flex items-center gap-2">
              <AppDeployBadge :status="job.status" />
              <div
                v-if="job.started_at && job.finished_at && job.status === JobStatus.SUCCESS"
                class="text-sm text-neutral-400"
              >
                (Finished in
                {{ formatDuration(new Date(job.started_at), new Date(job.finished_at)) }})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <section class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Detailed logs generated during the process.</CardDescription>
          <CardAction>
            <Button
              variant="secondary"
              size="icon-lg"
              @click="handleLogsCopy(copyLogs)"
            >
              <CheckIcon v-if="copiedLogs" />
              <ClipboardIcon v-else />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div
            ref="logsContainer"
            class="bg-background h-84 space-y-1 overflow-auto rounded-lg p-4 font-mono text-xs"
          >
            <template v-if="job.logs?.length">
              <div
                v-for="(l, i) in job.logs"
                :key="i"
                class="flex gap-3"
              >
                <span class="text-muted min-w-4">{{ i + 1 }}</span>
                <span class="text-muted-foreground text-nowrap">
                  {{ formatDate(new Date(l.timestamp), 'DD-MM-YYYY HH:mm:ss') }}
                </span>
                <span class="font-semibold text-nowrap">
                  {{ logLevelLabel(l.level) }}
                </span>
                <span class="flex-1 text-nowrap wrap-break-word">
                  {{ l.message }}
                </span>
              </div>
            </template>

            <template v-else>
              <div class="text-muted-foreground">no logs yet</div>
            </template>
          </div>
        </CardContent>
      </Card>
    </section>
  </template>

  <DataLoading v-else-if="loading" />
  <DataNotFound v-else />
</template>
