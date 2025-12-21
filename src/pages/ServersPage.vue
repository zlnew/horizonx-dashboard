<script setup lang="ts">
import { onMounted, onUnmounted, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { PlusIcon, RefreshCwIcon, ServerIcon, SquarePenIcon, TrashIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import ServerDeleteDialog from '@/components/dialogs/ServerDeleteDialog.vue'
import ServerRegisterDialog from '@/components/dialogs/ServerRegisterDialog.vue'
import ServerUpdateDialog from '@/components/dialogs/ServerUpdateDialog.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import useWebSocket from '@/composables/web-socket'
import WSEvent from '@/constants/ws-event'
import useAppStore from '@/stores/app'
import useServerStore from '@/stores/server'

const appStore = useAppStore()
const serverStore = useServerStore()
const { title, breadcrumb } = storeToRefs(appStore)
const { servers, loading, refetch, notFound } = storeToRefs(serverStore)

const { subscribe } = useWebSocket()
let sub: { unsubscribe: () => void }

watch(refetch, (refetched) => {
  if (refetched) {
    fetchServers()
  }
})

watchEffect((onCleanup) => {
  title.value = 'Servers'
  breadcrumb.value = [
    {
      label: 'Servers',
      to: { name: 'servers' }
    }
  ]

  onCleanup(() => {
    title.value = null
    breadcrumb.value = []
  })
})

onMounted(() => {
  fetchServers()

  sub = subscribe<ServerStatus>('server_status', (msg) => {
    if (msg.event === WSEvent.SERVER_STATUS_CHANGED) {
      serverStore.updateServerStatus(msg.payload)
    }
  })
})

onUnmounted(() => {
  sub?.unsubscribe()
  serverStore.cleanupState()
})

const fetchServers = async () => {
  try {
    await serverStore.getServers()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const handleRefresh = () => {
  refetch.value = true
}

const showRegisterModal = () => {
  serverStore.dialogRegisterOpen = true
}

const showUpdateModal = (server: Server) => {
  serverStore.selectedServer = server
  serverStore.dialogUpdateOpen = true
}

const showDeleteModal = (server: Server) => {
  serverStore.selectedServer = server
  serverStore.dialogDeleteOpen = true
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent rounded-lg p-3">
          <ServerIcon :size="24" />
        </div>
        <div class="flex flex-col gap-0">
          <div class="text-xl">Servers</div>
          <div class="text-sm text-neutral-400">
            Overview of all registered servers and their real-time agent status.
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button
          type="button"
          @click="showRegisterModal"
        >
          <PlusIcon />
          Register Server
        </Button>
      </div>
    </div>
  </section>

  <section class="mt-8 space-y-4">
    <div class="flex flex-wrap-reverse items-center justify-between gap-4 sm:flex-wrap">
      <div class="flex-auto sm:flex-1"></div>
      <div class="flex w-full items-center justify-end gap-2 sm:w-auto">
        <Button
          type="button"
          variant="outline"
          @click="handleRefresh"
        >
          <div class="text-neutral-400">
            <RefreshCwIcon />
          </div>
          Refresh
        </Button>
      </div>
    </div>

    <template v-if="servers.length">
      <div class="bg-card text-card-foreground rounded-lg p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-8">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Agent Status</TableHead>
              <TableHead class="text-end">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="(row, index) in servers"
              :key="index"
            >
              <TableCell>{{ index + 1 }}.</TableCell>
              <TableCell class="font-bold">
                <div>{{ row.name }}</div>
                <div class="text-xs font-normal text-neutral-400">ID: {{ row.id }}</div>
              </TableCell>
              <TableCell>{{ row.ip_address }}</TableCell>
              <TableCell>
                <Badge :variant="row.is_online ? 'default' : 'outline'">
                  {{ row.is_online ? 'Online' : 'Offline' }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    aria-label="Edit server"
                    @click="showUpdateModal(row)"
                  >
                    <SquarePenIcon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="destructive"
                    aria-label="Delete server"
                    @click="showDeleteModal(row)"
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else-if="notFound" />
  </section>

  <Teleport to="body">
    <ServerRegisterDialog />
    <ServerUpdateDialog />
    <ServerDeleteDialog />
  </Teleport>
</template>
