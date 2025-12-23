<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import DeploymentStatus from '@/constants/deployment-status'

const { status } = defineProps<{
  status: string
}>()

const variant = computed(() => {
  if (status === DeploymentStatus.FAILED) {
    return 'destructive'
  }

  if (status === DeploymentStatus.PENDING) {
    return 'outline'
  }

  if (status === DeploymentStatus.DEPLOYING) {
    return 'secondary'
  }

  return 'default'
})
</script>

<template>
  <Badge :variant="variant">{{ status }}</Badge>
</template>
