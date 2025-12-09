<script setup lang="ts">
import { FileSearchCornerIcon } from 'lucide-vue-next'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <FileSearchCornerIcon />
      </EmptyMedia>
      <EmptyTitle>No Records Found</EmptyTitle>
      <EmptyDescription>
        No data is currently available. Please create a new entry to continue.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
