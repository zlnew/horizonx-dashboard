<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ActivityIcon, ChevronRightIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import JobStatusBadge from '@/components/JobStatusBadge.vue'
import RoutePagination from '@/components/RoutePagination.vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useDate } from '@/composables/date'
import { defineBreadcrumbs, usePageMeta } from '@/composables/page-meta'
import useWebSocket from '@/composables/web-socket'
import WSEvent from '@/constants/ws-event'
import { jobTypeLabel } from '@/mapper/job'
import useApplicationStore from '@/stores/application'
import useJobStore from '@/stores/job'

type Criteria = JobCriteria

const route = useRoute()
const { formatDate } = useDate()
const { subscribe } = useWebSocket()
const applicationStore = useApplicationStore()
const jobStore = useJobStore()

const { selectedApplication: application, appID, canReadApp } = storeToRefs(applicationStore)
const { jobs, meta, refetch, loading, notFound } = storeToRefs(jobStore)

let jobSub: WSSubscribtion | null = null

const pageTitle = computed(() => `${application.value?.name} · Activities`)
const criteria = computed(() => route.query as Criteria)

usePageMeta({
  title: pageTitle,
  breadcrumb: computed(() =>
    defineBreadcrumbs([
      {
        label: 'Applications',
        to: { name: 'applications' }
      },
      {
        label: pageTitle.value,
        to: {
          name: 'applications.activities',
          params: { id: String(application.value?.id) }
        }
      }
    ])
  )
})

watch(refetch, (refetched) => {
  if (refetched) {
    fetchJobs(criteria.value)
  }
})

onMounted(() => {
  fetchJobs(criteria.value)
})

onBeforeRouteUpdate((to) => {
  const criteria = to.query as Criteria
  fetchJobs(criteria)
})

onUnmounted(() => {
  jobSub?.unsubscribe()
})

const fetchJobs = async (criteria: Criteria) => {
  if (!canReadApp.value) {
    return
  }

  try {
    await jobStore.getJobs({
      ...criteria,
      paginate: true,
      limit: 5,
      application_id: appID.value.toString()
    })
    listenJobEvents()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const listenJobEvents = () => {
  jobSub = subscribe('jobs', (msg) => {
    if (msg.event === WSEvent.JOB_CREATED) {
      fetchJobs(criteria.value)
      return
    }

    if (msg.event === WSEvent.JOB_FINISHED) {
      fetchJobs(criteria.value)
      return
    }

    if (msg.event === WSEvent.JOB_STATUS_CHANGED) {
      const payload = msg.payload as EventJobStatusChanged
      const idx = jobs.value.findIndex((j) => j.id === payload.job_id)
      if (idx != -1 && jobs.value[idx]) {
        jobs.value[idx].status = payload.status
      }
    }
  })
}
</script>

<template>
  <section>
    <Card class="border-border/50 bg-card/20 overflow-hidden backdrop-blur-md">
      <CardHeader class="border-border/50 flex-row items-center justify-between border-b pb-6">
        <div class="flex items-center gap-4">
          <div class="bg-accent/50 text-muted-foreground rounded-xl p-2.5">
            <ActivityIcon :size="20" />
          </div>
          <div>
            <CardTitle class="text-xl font-black tracking-tight uppercase">Activity Feed</CardTitle>
            <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60"
              >Audit trail of system jobs and automation events</CardDescription
            >
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-0">
        <div
          v-if="jobs.length"
          class="divide-border/20 divide-y"
        >
          <template
            v-for="(job, index) in jobs"
            :key="index"
          >
            <RouterLink
              :to="{
                name: 'applications.activities.show',
                params: { id: job.application_id, jobID: job.id }
              }"
              class="group flex items-center justify-between px-8 py-5 transition-all hover:bg-white/5 active:scale-[0.99]"
            >
              <div class="flex flex-col gap-1">
                <span
                  class="group-hover:text-primary text-sm font-black tracking-tight uppercase transition-colors"
                >
                  {{ jobTypeLabel(job.type) }}
                </span>
                <div class="flex items-center gap-3">
                  <JobStatusBadge
                    :status="job.status"
                    class="px-2 py-0.5 text-xs font-black tracking-wider uppercase"
                  />
                  <span class="text-muted-foreground/60 font-mono text-xs font-medium">
                    {{
                      job.queued_at
                        ? formatDate(new Date(job.queued_at), 'DD MMM, YYYY HH:mm')
                        : '-'
                    }}
                  </span>
                </div>
              </div>
              <div
                class="bg-accent/30 group-hover:bg-primary/20 group-hover:text-primary rounded-full p-2 transition-all"
              >
                <ChevronRightIcon class="size-4" />
              </div>
            </RouterLink>
          </template>
        </div>
        <DataLoading v-else-if="loading" />
        <DataNotFound v-else-if="notFound" />
      </CardContent>

      <CardFooter class="border-border/50 border-t px-6 py-4">
        <RoutePagination
          v-if="meta"
          :meta="meta"
        />
      </CardFooter>
    </Card>
  </section>
</template>
