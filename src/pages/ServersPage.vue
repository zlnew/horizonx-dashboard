<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  ServerIcon,
  SquarePenIcon,
  TrashIcon
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { dialog } from '@/composables/dialog'
import { usePageMeta } from '@/composables/page-meta'
import useWebSocket from '@/composables/web-socket'
import WSEvent from '@/constants/ws-event'
import useServerStore from '@/stores/server'

type Criteria = ServerCriteria

const route = useRoute()
const router = useRouter()
const serverStore = useServerStore()
const { servers, loading, refetch, notFound, search } = storeToRefs(serverStore)

const { subscribe } = useWebSocket()

let serverSub: WSSubscribtion | null = null

const criteria = computed(() => route.query as Criteria)

watch(refetch, (refetched) => {
  if (refetched) {
    fetchServers(criteria.value)
  }
})

usePageMeta({
  title: 'Servers',
  breadcrumb: [
    {
      label: 'Servers',
      to: { name: 'servers' }
    }
  ]
})

onMounted(() => {
  search.value = criteria.value.search ?? ''

  fetchServers(criteria.value)

  serverSub = subscribe<EventServerStatusChanged>('servers', (msg) => {
    if (msg.event === WSEvent.SERVER_STATUS_CHANGED) {
      serverStore.updateServerStatus(msg.payload)
    }
  })
})

onBeforeRouteUpdate((to) => {
  const criteria = to.query as Criteria

  search.value = criteria.search ?? ''
  fetchServers(criteria)
})

onUnmounted(() => {
  serverSub?.unsubscribe()
  serverStore.cleanupState()
})

const fetchServers = async (criteria: Criteria) => {
  try {
    await serverStore.getServers(criteria)
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const handleSearch = () => {
  router.push({
    query: {
      ...route.query,
      page: 1,
      search: search.value
    }
  })
}

const handleRefresh = () => {
  refetch.value = true
}

const showRegisterModal = () => {
  dialog.open(defineAsyncComponent(() => import('@/components/dialogs/ServerRegisterDialog.vue')))
}

const showUpdateModal = (server: Server) => {
  serverStore.selectedServer = server
  dialog.open(defineAsyncComponent(() => import('@/components/dialogs/ServerUpdateDialog.vue')))
}

const showDeleteModal = (server: Server) => {
  serverStore.selectedServer = server
  dialog.open(defineAsyncComponent(() => import('@/components/dialogs/ServerDeleteDialog.vue')))
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
      <div class="flex-auto sm:flex-1">
        <InputGroup>
          <InputGroupInput
            v-model="search"
            placeholder="Search&hellip;"
            @keyup.enter="handleSearch"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
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
</template>
