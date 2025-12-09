<script setup lang="ts">
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
</script>

<template>
  <Empty class="w-full">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Spinner />
      </EmptyMedia>
      <EmptyTitle>Processing Request</EmptyTitle>
      <EmptyDescription>
        Your request is being processed. This may take a few seconds.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
