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
      <EmptyTitle class="font-black tracking-tight uppercase">Terminal Disconnected</EmptyTitle>
      <EmptyDescription class="text-xs font-medium tracking-wide">
        The remote monitoring agent is currently unreachable. Please verify server connectivity and
        ensure the agent process is active on the host machine.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
