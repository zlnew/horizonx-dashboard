<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ActivityIcon, AlertTriangleIcon, ClockIcon, ListChecksIcon, LoaderCircleIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import JobApi from '@/api/Job'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useNumber } from '@/composables/number'

// P2-17: queue visibility — job depth by status from GET /jobs/summary.
const { formatNumber } = useNumber()

const counts = ref<JobStatusCounts | null>(null)
const loading = ref(true)

const fetchSummary = async () => {
  loading.value = true
  try {
    const res = await new JobApi().summary<ApiResponse<JobStatusCounts>>()
    if (res.data) {
      counts.value = res.data
    }
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    loading.value = false
  }
}

onMounted(fetchSummary)
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center gap-2">
      <div class="bg-primary/10 border-primary/20 rounded-xl border p-2.5 shadow-inner">
        <ListChecksIcon :size="18" class="text-primary" />
      </div>
      <div class="flex flex-col">
        <h2 class="text-sm font-black tracking-widest uppercase">Job Queue</h2>
        <span class="text-muted-foreground text-[11px] font-bold tracking-wide uppercase opacity-60">
          control-plane queue depth
        </span>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
    </div>

    <div
      v-else-if="counts"
      class="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      <!-- Queued -->
      <Card class="border-border/50 bg-card/30 backdrop-blur-md">
        <CardContent class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-[10px] font-black tracking-widest uppercase opacity-60">
              Queued
            </span>
            <ClockIcon :size="16" class="text-muted-foreground/50" />
          </div>
          <p class="mt-3 text-3xl font-black tracking-tighter">
            {{ formatNumber(counts.queued) }}
          </p>
        </CardContent>
      </Card>

      <!-- Running -->
      <Card class="border-border/50 bg-card/30 backdrop-blur-md">
        <CardContent class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-[10px] font-black tracking-widest uppercase opacity-60">
              Running
            </span>
            <LoaderCircleIcon :size="16" class="text-primary animate-spin" />
          </div>
          <p class="mt-3 text-3xl font-black tracking-tighter">
            {{ formatNumber(counts.running) }}
          </p>
        </CardContent>
      </Card>

      <!-- Failed -->
      <Card
        class="border-border/50 bg-card/30 backdrop-blur-md"
        :class="{ 'border-red-500/30': counts.failed > 0 }"
      >
        <CardContent class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-[10px] font-black tracking-widest uppercase opacity-60">
              Failed
            </span>
            <AlertTriangleIcon
              :size="16"
              :class="counts.failed > 0 ? 'text-red-400' : 'text-muted-foreground/50'"
            />
          </div>
          <p
            class="mt-3 text-3xl font-black tracking-tighter"
            :class="{ 'text-red-400': counts.failed > 0 }"
          >
            {{ formatNumber(counts.failed) }}
          </p>
        </CardContent>
      </Card>

      <!-- Total -->
      <Card class="border-border/50 bg-card/30 backdrop-blur-md">
        <CardContent class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-[10px] font-black tracking-widest uppercase opacity-60">
              Total
            </span>
            <ActivityIcon :size="16" class="text-muted-foreground/50" />
          </div>
          <p class="mt-3 text-3xl font-black tracking-tighter">
            {{ formatNumber(counts.total) }}
          </p>
        </CardContent>
      </Card>
    </div>

    <p
      v-if="counts && counts.running > 0"
      class="text-muted-foreground flex items-center gap-2 text-xs font-medium"
    >
      <LoaderCircleIcon :size="14" class="text-primary animate-spin" />
      {{ counts.running }} job{{ counts.running === 1 ? '' : 's' }} running — the reaper
      auto-fails jobs stuck past 30 minutes.
    </p>
  </section>
</template>
