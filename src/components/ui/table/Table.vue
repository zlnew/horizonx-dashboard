<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="table-container"
    role="region"
    aria-label="Scrollable table"
    tabindex="0"
    class="focus-visible:ring-ring/40 relative w-full overflow-auto focus-visible:ring-2 focus-visible:outline-none"
  >
    <table
      data-slot="table"
      :class="cn('w-full caption-bottom text-sm', props.class)"
    >
      <slot />
    </table>
  </div>
</template>
