<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { appStatusLabel, appStatusVariant } from '@/mapper/application'

const { status } = defineProps<{
  status: string
}>()
</script>

<template>
  <Badge :variant="appStatusVariant(status)">{{ appStatusLabel(status) }}</Badge>
</template>
