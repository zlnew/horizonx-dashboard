<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import JobApi from '@/api/Job'
import JobStatus from '@/constants/job-status'
import { jobStatusLabel } from '@/mapper/job'

// Compact queue-depth chips for the Jobs page header (B4). Replaces the old
// JobQueuePanel cards — same GET /jobs/summary data, page-header density.
// Each chip is a filter trigger: click sets ?status= on the list.
const props = defineProps<{
  status?: string | null
  tick?: number
}>()

const router = useRouter()
const route = useRoute()

const counts = ref<JobStatusCounts | null>(null)
const loading = ref(true)

const fetchSummary = async () => {
  try {
    const res = await new JobApi().summary<ApiResponse<JobStatusCounts>>()
    counts.value = res.data ?? null
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    loading.value = false
  }
}

onMounted(fetchSummary)

// Parent bumps tick (debounced 500ms) whenever the jobs WS channel reports
// JOB_STATUS_CHANGED / JOB_STARTED / JOB_FINISHED / JOB_CREATED — keeps the
// counts live without firing one request per event.
watch(
  () => props.tick,
  () => {
    fetchSummary()
  }
)

const setFilter = (status: string | null) => {
  const query = { ...route.query }
  if (status) {
    query.statuses = status
  } else {
    delete query.statuses
  }
  router.push({ query })
}

const chips: Array<{ key: keyof JobStatusCounts; status: string | null }> = [
  { key: 'queued', status: JobStatus.QUEUED },
  { key: 'running', status: JobStatus.RUNNING },
  { key: 'failed', status: JobStatus.FAILED },
  { key: 'total', status: null }
]

const chipValue = (key: keyof JobStatusCounts) => counts.value?.[key] ?? 0
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <template v-if="loading">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-accent/50 h-7 w-16 animate-pulse rounded-full"
      />
    </template>

    <template v-else-if="counts">
      <button
        v-for="chip in chips"
        :key="chip.key"
        type="button"
        class="hover:bg-accent/80 border-border/50 bg-accent/30 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase transition-all"
        :class="[
          status === chip.status
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground',
          chip.key === 'failed' && chipValue('failed') > 0 && status !== 'failed'
            ? 'border-destructive/40 text-destructive'
            : ''
        ]"
        :aria-pressed="status === chip.status"
        :title="chip.status ? `Filter: ${jobStatusLabel(chip.status)} jobs` : 'All jobs'"
        @click="setFilter(chip.status)"
      >
        <span>{{ chip.status ? jobStatusLabel(chip.status) : 'All' }}</span>
        <span class="text-foreground font-black tabular-nums">
          {{ chipValue(chip.key) }}
        </span>
      </button>
    </template>
  </div>
</template>
