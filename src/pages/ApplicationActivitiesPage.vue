<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ChevronRightIcon } from 'lucide-vue-next'
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle
} from '@/components/ui/item'
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

const { selectedApplication: application, appID } = storeToRefs(applicationStore)
const { jobs, meta, refetch, loading, notFound } = storeToRefs(jobStore)

let jobSub: { unsubscribe: () => void }

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
  <section class="mt-8">
    <Card>
      <CardHeader>
        <CardTitle>Activities</CardTitle>
        <CardDescription>
          Track recent activities for this application, including execution status and when each job
          entered the queue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="jobs.length">
          <ItemGroup>
            <template
              v-for="(job, index) in jobs"
              :key="index"
            >
              <Item
                as-child
                class="rounded-none"
              >
                <RouterLink
                  :to="{
                    name: 'applications.activities.show',
                    params: { id: job.application_id, jobID: job.id }
                  }"
                >
                  <ItemContent>
                    <ItemTitle>{{ jobTypeLabel(job.type) }}</ItemTitle>
                    <ItemDescription class="mt-2">
                      <div class="flex items-center gap-2">
                        <JobStatusBadge :status="job.status" />
                        <span>&middot;</span>
                        <span>
                          {{
                            job.queued_at
                              ? formatDate(new Date(job.queued_at), 'DD MMM, YYYY HH:mm')
                              : '-'
                          }}
                        </span>
                      </div>
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRightIcon class="size-4" />
                  </ItemActions>
                </RouterLink>
              </Item>
              <ItemSeparator v-if="index !== jobs.length - 1" />
            </template>
          </ItemGroup>
        </div>
        <DataLoading v-else-if="loading" />
        <DataNotFound v-else-if="notFound" />
      </CardContent>
      <CardFooter>
        <RoutePagination
          v-if="meta"
          :meta="meta"
        />
      </CardFooter>
    </Card>
  </section>
</template>
