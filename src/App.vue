<script setup lang="ts">
import { onMounted } from 'vue'
import AppLoading from '@/components/AppLoading.vue'
import DialogRenderer from '@/components/DialogRenderer.vue'
import { Toaster } from '@/components/ui/sonner'
import { getHealth } from '@/composables/fetch'

onMounted(async () => {
  try {
    console.log('app starting... initiating websocket handshake.')
    await getHealth()
    console.log('websocket handshake success.')
  } catch (e) {
    console.error('websocket handshake failed.', e)
  }
})
</script>

<template>
  <RouterView />

  <AppLoading />
  <DialogRenderer />
  <Toaster position="top-center" />
</template>
