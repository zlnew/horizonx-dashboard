<script setup lang="ts">
import { OrbitIcon } from 'lucide-vue-next'
</script>

<template>
  <header>
    <div class="container mx-auto h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <OrbitIcon />
        <div class="text-lg font-bold">
          <span class="text-neutral-400">Horizon</span>
          <span>X</span>
        </div>
      </div>
    </div>
  </header>

  <main class="container mx-auto mt-4">
    <RouterView />
  </main>
</template>
