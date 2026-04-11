<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useClipboard } from '@vueuse/core'
import { CheckIcon, ClipboardIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppDeployBadge from '@/components/AppDeployBadge.vue'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import LogResult from '@/components/LogResult.vue'
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

const { selectedApplication: application, appID, canReadApp } = storeToRefs(applicationStore)
const { selectedJob: job, jobID } = storeToRefs(jobStore)
const loading = ref(false)

let jobSub: WSSubscribtion | null = null
let logSub: WSSubscribtion | null = null

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
  if (!canReadApp.value) {
    return
  }

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
  <div
    v-if="job"
    class="space-y-12"
  >
    <!-- Activity Metadata Overview -->
    <section>
      <Card class="border-border/50 bg-card/30 overflow-hidden backdrop-blur-md">
        <CardHeader class="border-border/50 flex-row items-center justify-between border-b pb-6">
          <div class="flex items-center gap-4">
            <div class="bg-primary/10 text-primary rounded-xl p-2.5">
              <ClipboardIcon :size="20" />
            </div>
            <div>
              <CardTitle class="text-xl font-black tracking-tight uppercase"
                >Execution Report</CardTitle
              >
              <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60">
                Queued
                {{
                  job.queued_at ? formatDate(new Date(job.queued_at), 'DD MMM, YYYY HH:mm') : '-'
                }}
              </CardDescription>
            </div>
          </div>
          <CardAction>
            <AppDeployBadge
              :status="job.status"
              class="px-3 py-1 text-xs font-black tracking-widest uppercase"
            />
          </CardAction>
        </CardHeader>
        <CardContent class="px-8 pt-8">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div class="border-accent flex flex-col gap-2 border-l-2 pl-4">
              <span
                class="text-muted-foreground/60 text-xs leading-none font-black tracking-widest uppercase"
                >Job Classification</span
              >
              <span class="text-sm leading-none font-bold tracking-tight uppercase">{{
                jobTypeLabel(job.type)
              }}</span>
            </div>

            <div
              class="border-accent flex flex-col gap-2 border-l-2 pl-4 md:col-span-2 lg:col-span-1"
            >
              <span
                class="text-muted-foreground/60 text-xs leading-none font-black tracking-widest uppercase"
                >Processing Pipeline</span
              >
              <div
                v-if="job.started_at && job.finished_at && job.status === JobStatus.SUCCESS"
                class="text-sm leading-none font-bold tracking-tight uppercase"
              >
                Finished in
                {{ formatDuration(new Date(job.started_at), new Date(job.finished_at)) }}
              </div>
              <div
                v-else
                class="text-sm leading-none font-bold tracking-tight uppercase italic opacity-40"
              >
                {{ job.status }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- Activity Logs Section -->
    <section>
      <Card class="border-border/50 backdrop-blur-xl">
        <CardHeader class="border-border/50 flex-row items-center justify-between border-b pb-6">
          <div class="flex items-center gap-4">
            <div class="bg-accent/50 text-muted-foreground rounded-xl p-2.5">
              <CheckIcon
                v-if="copiedLogs"
                class="text-green-500"
              />
              <ClipboardIcon v-else />
            </div>
            <div>
              <CardTitle class="text-xl font-black tracking-tight uppercase"
                >Terminal Output</CardTitle
              >
              <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60"
                >Raw process execution output and system signals</CardDescription
              >
            </div>
          </div>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              class="rounded-full text-xs font-black tracking-tight uppercase active:scale-95"
              @click="handleLogsCopy(copyLogs)"
            >
              <ClipboardIcon class="mr-2 size-3.5" />
              Export Logs
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent class="p-0">
          <div
            class="custom-scrollbar max-h-[600px] overflow-y-auto p-6 font-mono text-xs leading-relaxed"
          >
            <LogResult :data="job.logs" />
          </div>
        </CardContent>
      </Card>
    </section>
  </div>

  <DataLoading v-else-if="loading" />
  <DataNotFound v-else />
</template>
