<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { BoltIcon, FileClock, GaugeIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Item, ItemContent, ItemGroup, ItemSeparator, ItemTitle } from '@/components/ui/item'
import useApplicationStore from '@/stores/application'

const route = useRoute()
const applicationStore = useApplicationStore()

const { selectedApplication } = storeToRefs(applicationStore)
const loading = ref(false)

const appID = computed(() => Number(route.params.id))

const menu = [
  {
    label: 'Application Overview',
    to: { name: 'applications.overview', params: { id: appID.value } },
    icon: GaugeIcon
  },
  {
    label: 'Configuration',
    to: { name: 'applications.configuration', params: { id: appID.value } },
    icon: BoltIcon
  },
  {
    label: 'Deploys',
    to: { name: 'applications.deploys', params: { id: appID.value } },
    icon: FileClock
  }
]

onMounted(() => {
  fetchApplication()
})

const fetchApplication = async () => {
  loading.value = true

  try {
    const res = await applicationStore.showApplication(appID.value)
    if (res) {
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
  <div class="grid grid-cols-1 gap-8 xl:grid-cols-4">
    <div class="flex w-full max-w-md flex-col gap-6">
      <ItemGroup>
        <template
          v-for="(m, index) in menu"
          :key="index"
        >
          <RouterLink
            :to="m.to"
            #="{ isExactActive }"
          >
            <Item class="group px-0">
              <ItemContent>
                <ItemTitle
                  :class="isExactActive ? 'font-bold' : 'text-neutral-400'"
                  class="group-hover:text-foreground transition-colors"
                >
                  <component
                    v-if="m.icon"
                    :is="m.icon"
                    :size="16"
                  />
                  {{ m.label }}
                </ItemTitle>
              </ItemContent>
            </Item>
            <ItemSeparator v-if="index !== menu.length - 1" />
          </RouterLink>
        </template>
      </ItemGroup>
    </div>

    <div class="xl:col-span-3">
      <RouterView />
    </div>
  </div>
</template>
