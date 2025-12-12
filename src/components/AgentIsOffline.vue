<script setup lang="ts">
import { PlugIcon } from 'lucide-vue-next'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <PlugIcon />
      </EmptyMedia>
      <EmptyTitle>Agent is offline</EmptyTitle>
      <EmptyDescription>
        The monitoring agent isn’t responding right now. Check if the server is running and the
        agent service is active.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
