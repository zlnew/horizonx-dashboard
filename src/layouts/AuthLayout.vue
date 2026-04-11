<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
import AppLogo from '@/components/AppLogo.vue'
</script>

<template>
  <main class="container mx-auto flex min-h-dvh flex-col items-center justify-center py-12">
    <AppLogo class="mb-8" />
    <div class="flex w-full flex-1 items-center justify-center">
      <RouterView />
    </div>
    <AppFooter />
  </main>
</template>
