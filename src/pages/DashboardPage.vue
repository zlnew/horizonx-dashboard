<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import StorageResource from '@/components/StorageResource.vue'
import SystemHealth from '@/components/SystemHealth.vue'
import SystemPerformance from '@/components/SystemPerformance.vue'
import useAppStore from '@/stores/app'

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
