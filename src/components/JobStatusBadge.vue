<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import JobStatus from '@/constants/job-status'
import { jobStatusLabel } from '@/mapper/job'

const { status } = defineProps<{
  status: string
}>()

const variant = computed(() => {
  switch (status) {
    case JobStatus.FAILED:
      return 'destructive'

    case JobStatus.QUEUED:
      return 'outline'

    case JobStatus.RUNNING:
      return 'secondary'

    case JobStatus.SUCCESS:
      return 'default'

    default:
      return 'default'
  }
})
</script>

<template>
  <Badge :variant="variant">{{ jobStatusLabel(status) }}</Badge>
</template>
