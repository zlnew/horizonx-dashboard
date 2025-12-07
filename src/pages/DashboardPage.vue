<script setup lang="ts">
import useAppStore from '@/stores/app'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import SystemHealth from '@/components/SystemHealth.vue'
import StorageResource from '@/components/StorageResource.vue'
import SystemPerformance from '@/components/SystemPerformance.vue'

const appStore = useAppStore()
const { title } = storeToRefs(appStore)

onMounted(() => {
  title.value = 'Dashboard'
})
</script>

<template>
  <SystemHealth />
  <SystemPerformance />
  <StorageResource />
</template>
