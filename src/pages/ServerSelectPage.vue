<script setup lang="ts">
import { defineAsyncComponent, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { PlusIcon, Server } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppLogo from '@/components/AppLogo.vue'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { dialog } from '@/composables/dialog'
import useAppStore from '@/stores/app'
import useServerStore from '@/stores/server'

const router = useRouter()
const appStore = useAppStore()
const serverStore = useServerStore()
const { serverID } = storeToRefs(appStore)
const { servers, refetch, canReadServer, canWriteServer } = storeToRefs(serverStore)

watch(refetch, (refetched) => {
  if (refetched) {
    fetchServers()
  }
})

onMounted(() => {
  fetchServers()
})

const fetchServers = async () => {
  if (!canReadServer.value) {
    return
  }

  try {
    await serverStore.getServers()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const selectServer = (id: string) => {
  serverID.value = id
  setTimeout(() => {
    router.replace('/dashboard')
  }, 150)
}

const showAddServerDialog = () => {
  dialog.open(defineAsyncComponent(() => import('@/components/dialogs/ServerRegisterDialog.vue')))
}
</script>

<template>
  <main
    class="bg-background selection:bg-primary/20 relative flex min-h-dvh flex-col items-center justify-center overflow-hidden"
  >
    <!-- Background Decor -->
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="bg-primary/5 absolute top-0 left-1/4 size-[50%] rounded-full blur-[120px]"></div>
      <div
        class="bg-accent/5 absolute right-1/4 bottom-0 size-[50%] rounded-full blur-[120px]"
      ></div>
    </div>

    <!-- Branding -->
    <div class="animate-in fade-in slide-in-from-top-4 mb-12 duration-1000">
      <AppLogo class="scale-125" />
    </div>

    <div
      class="animate-in fade-in slide-in-from-bottom-4 w-full max-w-4xl px-6 delay-200 duration-1000"
    >
      <div class="mb-12 text-center">
        <h1 class="mb-2 text-3xl font-black tracking-tight uppercase">Choose your Workspace</h1>
        <p
          class="text-muted-foreground text-sm font-medium tracking-widest uppercase italic opacity-60"
        >
          Select a centralized server node to manage infrastructure
        </p>
      </div>

      <div class="grid grid-cols-2 items-center justify-center gap-6 sm:grid-cols-3 lg:grid-cols-4">
        <template
          v-for="(srv, index) in servers"
          :key="index"
        >
          <div
            class="group relative cursor-pointer"
            @click="selectServer(srv.id)"
          >
            <div
              class="bg-primary/20 absolute -inset-1 rounded-2xl opacity-0 blur transition duration-500 group-hover:opacity-100"
            ></div>
            <Item
              variant="muted"
              class="border-border/50 bg-card/50 relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 p-6 text-center backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1"
            >
              <ItemContent class="flex flex-col items-center gap-4">
                <div
                  class="bg-primary/10 flex size-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110"
                >
                  <Server class="text-primary size-6" />
                </div>
                <div>
                  <ItemTitle class="text-sm font-black tracking-tight uppercase">{{
                    srv.name
                  }}</ItemTitle>
                  <ItemDescription class="mt-1 font-mono text-[10px] opacity-60">{{
                    srv.ip_address
                  }}</ItemDescription>
                </div>
              </ItemContent>
            </Item>
          </div>
        </template>

        <div
          v-if="canWriteServer"
          class="group relative cursor-pointer"
          @click="showAddServerDialog"
        >
          <div
            class="bg-accent/20 absolute -inset-1 rounded-2xl opacity-0 blur transition duration-500 group-hover:opacity-100"
          ></div>
          <Item
            variant="outline"
            class="border-border/50 bg-accent/5 relative flex aspect-square flex-col items-center justify-center rounded-2xl border-dashed p-6 text-center transition-all duration-300 group-hover:-translate-y-1"
          >
            <ItemContent class="flex flex-col items-center gap-4">
              <div class="bg-accent/20 flex size-12 items-center justify-center rounded-xl">
                <PlusIcon class="text-accent-foreground size-6" />
              </div>
              <div>
                <ItemTitle class="text-sm font-black tracking-tight uppercase"
                  >Add Server</ItemTitle
                >
                <ItemDescription
                  class="text-accent-foreground mt-1 text-[10px] font-medium italic opacity-60"
                  >New Instance</ItemDescription
                >
              </div>
            </ItemContent>
          </Item>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
