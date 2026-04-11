<script setup lang="ts">
import { ChevronRightIcon } from 'lucide-vue-next'
import AppDeployBadge from '@/components/AppDeployBadge.vue'
import { useDate } from '@/composables/date'

defineProps<{
  data: Deployment
}>()

const { formatDate } = useDate()
</script>

<template>
  <RouterLink
    :to="{
      name: 'applications.deploys.show',
      params: { id: data.application_id, deploymentID: data.id }
    }"
    class="group flex items-center justify-between transition-all active:scale-[0.99]"
  >
    <div class="flex flex-col gap-1">
      <span
        class="group-hover:text-primary text-sm font-black tracking-tight uppercase transition-colors"
      >
        {{ data.branch }}@{{ data.commit_hash?.substring(0, 7) ?? '~~~~~~~' }}
      </span>
      <div class="flex items-center gap-3">
        <AppDeployBadge
          :status="data.status"
          class="px-2 py-0.5 text-xs font-black tracking-wider uppercase"
        />
        <span class="text-muted-foreground/60 font-mono text-xs font-medium">
          {{ formatDate(new Date(data.triggered_at), 'DD MMM, YYYY HH:mm') }}
        </span>
        <span class="text-muted-foreground/30 font-light">•</span>
        <span
          class="text-muted-foreground/50 max-w-[200px] truncate text-xs italic sm:max-w-[400px]"
        >
          {{ data.commit_message || 'No deployment notes' }}
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
