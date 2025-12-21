<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import useAppStore from '@/stores/app'
import useApplicationStore from '@/stores/application'

const route = useRoute()
const appStore = useAppStore()
const applicationStore = useApplicationStore()

const { title } = storeToRefs(appStore)
const { selectedApplication } = storeToRefs(applicationStore)
const loading = ref(false)

const appID = computed(() => Number(route.params.id))

onMounted(() => {
  fetchApplication()
})

const fetchApplication = async () => {
  loading.value = true

  try {
    const res = await applicationStore.showApplication(appID.value)
    if (res) {
      title.value = res.name
      selectedApplication.value = res
    }
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div></div>
</template>
