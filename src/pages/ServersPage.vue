<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  BoxesIcon,
  KeyRoundIcon,
  PlusIcon,
  SearchIcon,
  ServerIcon,
  SquarePenIcon,
  TrashIcon
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import PageHeader from '@/components/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
const { servers, loading, refetch, notFound, search, canReadServer, canWriteServer } =
  storeToRefs(serverStore)

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
  if (!canReadServer.value) {
    return
  }

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
const showRotateSecretModal = (server: Server) => {
  serverStore.selectedServer = server
  dialog.open(
    defineAsyncComponent(() => import('@/components/dialogs/ServerRotateSecretDialog.vue'))
  )
}

// P3-20: fleet overview summary.
const fleetSummary = computed(() => {
  const online = servers.value.filter((s) => s.is_online).length
  const offline = servers.value.length - online
  const apps = servers.value.reduce((sum, s) => sum + (s.application_count ?? 0), 0)
  return { total: servers.value.length, online, offline, apps }
})
</script>

<template>
  <section>
    <PageHeader
      :icon="ServerIcon"
      title="Servers"
      description="Overview of all registered servers and their real-time agent status."
    >
      <template #actions>
        <Button
          v-if="canWriteServer"
          type="button"
          class="shadow-primary/10 rounded-full shadow-lg transition-transform active:scale-95"
          @click="showRegisterModal"
        >
          <PlusIcon />
          Register Server
        </Button>
      </template>
    </PageHeader>
  </section>

  <!-- P3-20: fleet summary cards -->
  <section class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
    <Card class="border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent class="flex items-center gap-3 py-5">
        <div class="bg-primary/10 text-primary rounded-xl p-2.5">
          <ServerIcon :size="18" />
        </div>
        <div>
          <p class="text-2xl leading-none font-black">{{ fleetSummary.total }}</p>
          <p class="text-muted-foreground text-xs font-medium tracking-widest uppercase">Servers</p>
        </div>
      </CardContent>
    </Card>
    <Card class="border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent class="flex items-center gap-3 py-5">
        <div class="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
          <ServerIcon :size="18" />
        </div>
        <div>
          <p class="text-2xl leading-none font-black">{{ fleetSummary.online }}</p>
          <p class="text-muted-foreground text-xs font-medium tracking-widest uppercase">Online</p>
        </div>
      </CardContent>
    </Card>
    <Card class="border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent class="flex items-center gap-3 py-5">
        <div class="rounded-xl bg-red-500/10 p-2.5 text-red-500">
          <ServerIcon :size="18" />
        </div>
        <div>
          <p class="text-2xl leading-none font-black">{{ fleetSummary.offline }}</p>
          <p class="text-muted-foreground text-xs font-medium tracking-widest uppercase">Offline</p>
        </div>
      </CardContent>
    </Card>
    <Card class="border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent class="flex items-center gap-3 py-5">
        <div class="rounded-xl bg-sky-500/10 p-2.5 text-sky-500">
          <BoxesIcon :size="18" />
        </div>
        <div>
          <p class="text-2xl leading-none font-black">{{ fleetSummary.apps }}</p>
          <p class="text-muted-foreground text-xs font-medium tracking-widest uppercase">Apps</p>
        </div>
      </CardContent>
    </Card>
  </section>

  <section class="mt-12 space-y-4">
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
    </div>

    <template v-if="servers.length">
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-8">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Agent Status</TableHead>
                <TableHead class="text-end">Apps</TableHead>
                <TableHead
                  v-if="canWriteServer"
                  class="text-end"
                >
                  Action
                </TableHead>
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
                  <div class="text-muted-foreground text-xs font-normal">ID: {{ row.id }}</div>
                </TableCell>
                <TableCell>{{ row.ip_address }}</TableCell>
                <TableCell>
                  <Badge :variant="row.is_online ? 'default' : 'outline'">
                    {{ row.is_online ? 'Online' : 'Offline' }}
                  </Badge>
                </TableCell>
                <TableCell class="text-end font-semibold">
                  {{ row.application_count ?? 0 }}
                </TableCell>
                <TableCell v-if="canWriteServer">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      class="border-border/50 bg-accent/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30 rounded-lg border transition-all"
                      aria-label="Rotate server token"
                      title="Rotate server token"
                      @click="showRotateSecretModal(row)"
                    >
                      <KeyRoundIcon :size="16" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      class="border-border/50 bg-accent/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30 rounded-lg border transition-all"
                      aria-label="Edit server"
                      @click="showUpdateModal(row)"
                    >
                      <SquarePenIcon :size="16" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      class="border-border/50 bg-accent/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-lg border transition-all"
                      aria-label="Delete server"
                      @click="showDeleteModal(row)"
                    >
                      <TrashIcon :size="16" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else-if="notFound" />
  </section>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
