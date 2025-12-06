<script setup lang="ts">
import ServerOverview from '@/components/ServerOverview.vue'
import useAppStore from '@/stores/app'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const appStore = useAppStore()
const { title } = storeToRefs(appStore)

onMounted(() => {
  title.value = 'Dashboard'
})
</script>

<template>
  <ServerOverview />
</template>
