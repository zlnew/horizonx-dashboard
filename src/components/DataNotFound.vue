<script setup lang="ts">
import { FileSearchCornerIcon } from 'lucide-vue-next'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: 'No Records Found',
    description: 'Nothing here yet — check back once data is available.'
  }
)
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <FileSearchCornerIcon />
      </EmptyMedia>
      <EmptyTitle>{{ title }}</EmptyTitle>
      <EmptyDescription>
        {{ description }}
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
