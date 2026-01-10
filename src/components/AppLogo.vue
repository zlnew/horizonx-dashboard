<script setup lang="ts">
import { OrbitIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="flex items-center gap-2 text-base select-none">
    <div class="flex aspect-square size-8 items-center justify-center">
      <OrbitIcon class="size-6" />
    </div>
    <div class="grid flex-1 text-left text-base leading-tight">
      <div>
        <span class="font-normal tracking-widest text-neutral-300">Horizon</span>
        <span class="font-bold">X</span>
      </div>
    </div>
  </div>
</template>
