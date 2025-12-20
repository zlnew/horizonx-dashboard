<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { LayoutGridIcon, PlusIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import useAppStore from '@/stores/app'
import useApplicationStore from '@/stores/application'

const appStore = useAppStore()
const applicationStore = useApplicationStore()
const { title } = storeToRefs(appStore)
const {} = storeToRefs(applicationStore)

onMounted(() => {
  title.value = 'Applications'
  fetchApplications()
})

const fetchApplications = async () => {
  try {
    await applicationStore.getApplications({ server_id: appStore.serverID })
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent rounded-lg p-3">
          <LayoutGridIcon :size="24" />
        </div>
        <div class="flex flex-col gap-0">
          <div class="text-xl">Applications</div>
          <div class="text-sm text-neutral-400">Track and manage server-deployed applications.</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button asChild>
          <RouterLink :to="{ name: 'applications.create' }">
            <PlusIcon />
            Create Application
          </RouterLink>
        </Button>
      </div>
    </div>
  </section>
</template>
