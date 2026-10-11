<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { jobStatusLabel, jobStatusVariant } from '@/mapper/job'

const { status } = defineProps<{
  status: string
}>()
</script>

<template>
  <Badge :variant="jobStatusVariant(status)">{{ jobStatusLabel(status) }}</Badge>
</template>
