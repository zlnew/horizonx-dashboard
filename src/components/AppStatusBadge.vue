<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import ApplicationStatus from '@/constants/application-status'
import { appStatusLabel } from '@/mapper/application'

const { status } = defineProps<{
  status: string
}>()

const variant = computed(() => {
  switch (status) {
    case ApplicationStatus.FAILED:
      return 'destructive'

    case ApplicationStatus.STOPPED:
    case ApplicationStatus.UNKNOWN:
      return 'outline'

    case ApplicationStatus.STARTING:
    case ApplicationStatus.RESTARTING:
    case ApplicationStatus.DEPLOYING:
    case ApplicationStatus.STOPPING:
      return 'secondary'

    case ApplicationStatus.RUNNING:
      return 'default'

    default:
      return 'default'
  }
})
</script>

<template>
  <Badge :variant="variant">{{ appStatusLabel(status) }}</Badge>
</template>
