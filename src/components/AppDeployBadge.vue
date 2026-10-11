<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { deployStatusLabel, deployStatusVariant } from '@/mapper/deployment'

const { status } = defineProps<{
  status: string
}>()
</script>

<template>
  <Badge :variant="deployStatusVariant(status)">{{ deployStatusLabel(status) }}</Badge>
</template>
