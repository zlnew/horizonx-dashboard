<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import StorageResource from '@/components/StorageResource.vue'
import SystemHealth from '@/components/SystemHealth.vue'
import SystemPerformance from '@/components/SystemPerformance.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import useWebSocket from '@/composables/web-socket'
import WSEvent from '@/constants/ws-event'
import useAppStore from '@/stores/app'
import useMetricsStore from '@/stores/metrics'

const appStore = useAppStore()
const metricsStore = useMetricsStore()
const { title } = storeToRefs(appStore)

const { subscribe } = useWebSocket()
let sub: { unsubscribe: () => void }

onMounted(async () => {
  title.value = 'Dashboard'

  sub = subscribe<Metrics>('server:1:metrics', (msg) => {
    if (msg.event === WSEvent.METRICS_UPDATED) {
      metricsStore.metrics = msg.payload
    }
  })
})

onUnmounted(() => {
  sub?.unsubscribe()
})
</script>

<template>
  <section>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Server Monitor</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </section>

  <SystemHealth />
  <SystemPerformance />
  <StorageResource />
</template>
