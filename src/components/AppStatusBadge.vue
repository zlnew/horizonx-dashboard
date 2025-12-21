<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import ApplicationStatus from '@/constants/application-status'

const { status } = defineProps<{
  status: string
}>()

const variant = computed(() => {
  if (status === ApplicationStatus.FAILED) {
    return 'destructive'
  }

  if (status === ApplicationStatus.STOPPED) {
    return 'outline'
  }

  if (status === ApplicationStatus.STARTING) {
    return 'secondary'
  }

  if (status === ApplicationStatus.RESTARTING) {
    return 'secondary'
  }

  return 'default'
})
</script>

<template>
  <Badge :variant="variant">{{ status }}</Badge>
</template>
