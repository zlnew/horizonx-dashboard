<script setup lang="ts">
import { onMounted } from 'vue'
import { LogOutIcon, OrbitIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import MetricsApi from '@/api/Metrics'
import { Button } from '@/components/ui/button'
import useWebSocket from '@/composables/web-socket'
import useMetricsStore from '@/stores/metrics'

const metricsStore = useMetricsStore()
const { subscribe } = useWebSocket()

subscribe('metrics', (incoming) => {
  if (incoming.event === 'metrics.updated') {
    metricsStore.metrics = incoming.payload as Metrics | undefined
  }
})

onMounted(() => {
  fetchMetrics()
})

const fetchMetrics = async () => {
  try {
    metricsStore.metrics = await new MetricsApi().get<Metrics>()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <header>
    <div class="container mx-auto flex h-16 items-center justify-between">
      <div class="flex items-center gap-2">
        <OrbitIcon />
        <div class="text-lg font-bold">
          <span class="text-neutral-400">Horizon</span>
          <span>X</span>
        </div>
      </div>

      <div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Logout"
        >
          <LogOutIcon />
        </Button>
      </div>
    </div>
  </header>

  <main class="container mx-auto my-4 min-h-dvh">
    <RouterView />
  </main>

  <footer>
    <div class="container mx-auto flex h-16 items-center justify-center">
      <div class="text-sm text-neutral-400">Copyright (c) 2025 HorizonX. All Rights Reserved.</div>
    </div>
  </footer>
</template>
