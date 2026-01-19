<script setup lang="ts">
import { defineAsyncComponent, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { PlusIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
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
    router.replace('/')
  }, 150)
}

const showAddServerDialog = () => {
  dialog.open(defineAsyncComponent(() => import('@/components/dialogs/ServerRegisterDialog.vue')))
}
</script>

<template>
  <main class="container mx-auto flex min-h-dvh flex-col items-center justify-center gap-4">
    <div class="text-xl font-bold">Choose your server</div>
    <div class="flex items-center justify-center gap-4">
      <template
        v-for="(srv, index) in servers"
        :key="index"
      >
        <Item
          variant="muted"
          class="border-accent aspect-square"
          asChild
        >
          <a
            href="#"
            @click="selectServer(srv.id)"
          >
            <ItemContent>
              <ItemTitle>{{ srv.name }}</ItemTitle>
              <ItemDescription>{{ srv.ip_address }}</ItemDescription>
            </ItemContent>
          </a>
        </Item>
      </template>

      <Item
        v-if="canWriteServer"
        variant="outline"
        class="aspect-square"
        asChild
      >
        <a
          href="#"
          @click="showAddServerDialog"
        >
          <ItemContent>
            <div class="flex flex-col items-center justify-center">
              <PlusIcon />
              <span>Add Server</span>
            </div>
          </ItemContent>
        </a>
      </Item>
    </div>
  </main>
</template>
