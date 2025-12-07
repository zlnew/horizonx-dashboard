<script setup lang="ts">
import useAppStore from '@/stores/app'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import SystemHealth from '@/components/SystemHealth.vue'
import ComputePower from '@/components/ComputePower.vue'
import StorageResource from '@/components/StorageResource.vue'

const appStore = useAppStore()
const { title } = storeToRefs(appStore)

onMounted(() => {
  title.value = 'Dashboard'
})
</script>

<template>
  <SystemHealth />
  <ComputePower />
  <StorageResource />
</template>
