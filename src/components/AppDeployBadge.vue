<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import DeploymentStatus from '@/constants/deployment-status'

const { status } = defineProps<{
  status: string
}>()

const variant = computed(() => {
  switch (status) {
    case DeploymentStatus.FAILED:
      return 'destructive'

    case DeploymentStatus.PENDING:
      return 'outline'

    case DeploymentStatus.DEPLOYING:
      return 'secondary'

    case DeploymentStatus.SUCCESS:
      return 'default'

    default:
      return 'default'
  }
})
</script>

<template>
  <Badge :variant="variant">{{ status }}</Badge>
</template>
