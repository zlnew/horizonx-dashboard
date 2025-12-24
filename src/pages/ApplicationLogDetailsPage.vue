<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useClipboard } from '@vueuse/core'
import { CheckIcon, ClipboardIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppDeployBadge from '@/components/AppDeployBadge.vue'
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
import useApplicationStore from '@/stores/application'
import useJobStore from '@/stores/job'

const { subscribe } = useWebSocket()
const { formatDate, formatDuration } = useDate()
const applicationStore = useApplicationStore()
const jobStore = useJobStore()

const { selectedApplication: application, appID } = storeToRefs(applicationStore)
const { selectedJob: job, jobID } = storeToRefs(jobStore)
const loading = ref(false)

let jobSub: { unsubscribe: () => void }

usePageMeta({
  title: 'Details',
  breadcrumb: computed(() =>
    defineBreadcrumbs([
      {
        label: 'Applications',
        to: { name: 'applications' }
      },
      {
        label: `${application.value?.name} · Logs`,
        to: {
          name: 'applications.logs',
          params: { id: appID.value.toString() }
        }
      },
      {
        label: 'Details',
        to: {
          name: 'applications.logs.show',
          params: { id: appID.value.toString(), deploymentID: jobID.value.toString() }
        }
      }
    ])
  )
})

const { copy: copyOutputLog, copied: copiedOutputLog } = useClipboard()

watch(copiedOutputLog, (copied) => {
  if (copied) {
    toast.success('Copied output log')
  }
})

watch(
  () => job.value?.status,
  (status) => {
    const validStatus = [JobStatus.SUCCESS, JobStatus.FAILED]
    if (validStatus.includes(status ?? '')) {
      jobSub?.unsubscribe()
    }
  }
)

onMounted(() => {
  fetchJob()
})

onUnmounted(() => {
  jobSub?.unsubscribe()
  jobStore.selectedJob = null
})

const fetchJob = async () => {
  loading.value = true

  try {
    const res = await jobStore.showJob(jobID.value)
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
      fetchJob()
      return
    }
  })
}
</script>

<template>
  <template v-if="job">
    <section class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Log Details</CardTitle>
          <CardDescription>
            <div class="flex items-center gap-2 text-neutral-400">
              <span class="font-bold">{{ jobTypeLabel(job.job_type) }}</span>
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
          <CardTitle>Output</CardTitle>
          <CardDescription>Detailed output generated during the process.</CardDescription>
          <CardAction>
            <Button
              variant="secondary"
              size="icon-lg"
              @click="copyOutputLog"
            >
              <CheckIcon v-if="copiedOutputLog" />
              <ClipboardIcon v-else />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div class="bg-background h-84 overflow-auto rounded-lg p-4 font-mono text-xs">
            <pre>{{ job.output_log || 'Waiting for output…' }}</pre>
          </div>
        </CardContent>
      </Card>
    </section>
  </template>
</template>
