<script setup lang="ts">
import { onMounted } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import { getHealth } from '@/composables/fetch'

onMounted(async () => {
  try {
    console.log('🚀 App starting... Initiating handshake.')
    await getHealth()
    console.log('✅ Handshake success. System healthy.')
  } catch (e) {
    console.error('💀 Handshake failed.', e)
  }
})
</script>

<template>
  <RouterView />
  <Toaster position="top-center" />
</template>
