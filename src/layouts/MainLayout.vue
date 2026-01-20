<script setup lang="ts">
import { onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDocumentVisibility, useIdle } from '@vueuse/core'
import AppHeader from '@/components/AppHeader.vue'
import AppSearch from '@/components/AppSearch.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileDrawer from '@/components/MobileDrawer.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import useWebSocket from '@/composables/web-socket'
import useAppStore from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()
const { serverID } = storeToRefs(appStore)

const { connect: connectWs, disconnect: disconnectWs } = useWebSocket()
const { idle } = useIdle(3 * 60 * 1000)
const visibility = useDocumentVisibility()

watchEffect(() => {
  if (idle.value || visibility.value === 'hidden') {
    disconnectWs()
  } else {
    connectWs()
  }
})

onMounted(() => {
  redirectToServerSelection()
})

const redirectToServerSelection = () => {
  if (serverID.value === '') {
    router.replace({ name: 'servers.select' })
  }
}
</script>

<template>
  <SidebarProvider>
    <AppSidebar />

    <SidebarInset>
      <AppHeader />

      <main class="flex flex-1 flex-col p-4 sm:p-8">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>

  <Teleport to="body">
    <AppSearch />
    <MobileDrawer />
  </Teleport>
</template>
