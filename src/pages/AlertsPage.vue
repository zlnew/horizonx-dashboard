<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { BellIcon, CheckIcon, SearchIcon, ShieldCheckIcon } from 'lucide-vue-next'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { toast } from 'vue-sonner'
import AlertsApi from '@/api/Alerts'
import AlertSeverityBadge from '@/components/AlertSeverityBadge.vue'
import AlertStateBadge from '@/components/AlertStateBadge.vue'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import PageHeader from '@/components/PageHeader.vue'
import RoutePagination from '@/components/RoutePagination.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useDate } from '@/composables/date'
import { usePageMeta } from '@/composables/page-meta'
import { AlertSeverity, AlertState } from '@/constants/alert'
import Permission from '@/constants/permission'
import useAuthStore from '@/stores/auth'

type HistoryCriteria = AlertCriteria

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const { can } = storeToRefs(authStore)

const canReadAlerts = computed(() => can.value(Permission.ALERT_READ))
const canWriteAlerts = computed(() => can.value(Permission.ALERT_WRITE))

const api = new AlertsApi()

const { formatDate } = useDate()

usePageMeta({
  title: 'Alerts',
  breadcrumb: [
    {
      label: 'Alerts',
      to: { name: 'alerts.history' }
    }
  ]
})

const tab = ref<'active' | 'history'>('active')

const search = ref('')
const stateFilter = ref<string | null>(null)
const severityFilter = ref<string | null>(null)

const historyCriteria = computed<HistoryCriteria>(() => ({ ...route.query }))

const activeAlerts = ref<Alert[]>([])
const activeLoading = ref(false)
const activeNotFound = ref(false)

const history = ref<Alert[]>([])
const historyMeta = ref<Meta | null>(null)
const historyLoading = ref(false)
const historyNotFound = ref(false)

const acking = new Set<number>()

onMounted(() => {
  fetchActive()
  fetchHistory(historyCriteria.value)
})

onBeforeRouteUpdate((to) => {
  const c = to.query as HistoryCriteria
  search.value = c.search ?? ''
  fetchHistory(c)
})

onUnmounted(() => {
  // Nothing persistent to clean up — alert lists are page-local.
})

const fetchActive = async () => {
  if (!canReadAlerts.value) {
    return
  }

  activeLoading.value = true
  activeNotFound.value = false

  try {
    const res = await api.activeAlerts<ApiResponse<Alert[]>>()
    activeAlerts.value = res.data ?? []
    if (!res.data?.length) {
      activeNotFound.value = true
    }
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    activeLoading.value = false
  }
}

const fetchHistory = async (criteria: HistoryCriteria) => {
  if (!canReadAlerts.value) {
    return
  }

  historyLoading.value = true
  historyNotFound.value = false

  try {
    const res = await api.alertHistory<ApiResponse<Alert[]>>({
      ...criteria,
      paginate: true,
      limit: 10
    })
    history.value = res.data ?? []
    historyMeta.value = res.meta ?? null
    if (!res.data?.length) {
      historyNotFound.value = true
    }
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    historyLoading.value = false
  }
}

const applyFilters = useDebounceFn(() => {
  const q: Record<string, string> = {}
  if (search.value) q.search = search.value
  if (stateFilter.value) q.state = stateFilter.value
  if (severityFilter.value) q.severity = severityFilter.value
  router.push({ query: q })
}, 300)

const onStateFilter = (value: unknown) => {
  stateFilter.value = value === 'all' ? null : String(value ?? '')
  applyFilters()
}

const onSeverityFilter = (value: unknown) => {
  severityFilter.value = value === 'all' ? null : String(value ?? '')
  applyFilters()
}

const clearFilters = () => {
  search.value = ''
  stateFilter.value = null
  severityFilter.value = null
  router.push({ query: {} })
}

const hasActiveFilters = computed(
  () => !!search.value || !!stateFilter.value || !!severityFilter.value
)

watch(
  () => route.query,
  (q) => {
    stateFilter.value = (q.state as string) ?? null
    severityFilter.value = (q.severity as string) ?? null
  },
  { immediate: true }
)

watch(tab, (value) => {
  if (value === 'active') {
    // Freshen the active list whenever the tab is entered so an operator
    // returning from history sees the current state.
    fetchActive()
  }
})

const onAck = async (alert: Alert) => {
  if (acking.has(alert.id) || alert.acked) {
    return
  }

  acking.add(alert.id)

  try {
    const res = await api.acknowledge<ApiResponse<Alert>>(alert.id)
    const acked = res.data?.acked ?? true

    const idx = activeAlerts.value.findIndex((a) => a.id === alert.id)
    if (idx !== -1 && activeAlerts.value[idx]) {
      activeAlerts.value[idx].acked = acked
    }

    const hidx = history.value.findIndex((a) => a.id === alert.id)
    if (hidx !== -1 && history.value[hidx]) {
      history.value[hidx].acked = acked
    }

    toast.success(res.message ?? 'Alert acknowledged')
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    acking.delete(alert.id)
  }
}
</script>

<template>
  <section>
    <PageHeader
      :icon="BellIcon"
      title="Alerts"
      description="Firing alerts and their history across servers and applications"
    />
  </section>

  <section class="mt-12 space-y-6">
    <TabsRoot v-model="tab">
      <TabsList
        class="border-border/50 bg-accent/50 inline-flex h-10 items-center justify-start gap-1 rounded-lg border p-1"
      >
        <TabsTrigger
          value="active"
          class="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none"
        >
          Active Alerts
        </TabsTrigger>
        <TabsTrigger
          value="history"
          class="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none"
        >
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="active"
        class="mt-6"
      >
        <div class="space-y-4">
          <template v-if="activeAlerts.length">
            <Card>
              <CardContent class="p-0 sm:p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Server</TableHead>
                      <TableHead class="hidden md:table-cell">Fired At</TableHead>
                      <TableHead class="w-28 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      v-for="alert in activeAlerts"
                      :key="alert.id"
                    >
                      <TableCell>
                        <AlertSeverityBadge :severity="alert.severity" />
                      </TableCell>
                      <TableCell>
                        <RouterLink
                          :to="{ name: 'alerts.rules' }"
                          class="text-primary hover:underline"
                        >
                          {{ alert.rule?.name ?? `Rule #${alert.rule_id}` }}
                        </RouterLink>
                      </TableCell>
                      <TableCell class="max-w-xs">
                        <span class="line-clamp-2 text-sm">{{ alert.message }}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          :title="alert.server_id"
                          class="text-muted-foreground font-mono text-xs"
                        >
                          {{ alert.server?.name ?? `#${alert.server_id}` }}
                        </span>
                      </TableCell>
                      <TableCell class="text-muted-foreground hidden text-xs md:table-cell">
                        {{ formatDate(alert.first_fired_at, 'DD-MM-YYYY HH:mm:ss') }}
                      </TableCell>
                      <TableCell class="text-right">
                        <Button
                          v-if="canWriteAlerts && !alert.acked"
                          type="button"
                          size="sm"
                          variant="outline"
                          :disabled="acking.has(alert.id)"
                          @click="onAck(alert)"
                        >
                          <CheckIcon :size="14" />
                          {{ acking.has(alert.id) ? 'Acknowledging…' : 'Ack' }}
                        </Button>
                        <span
                          v-else
                          class="text-muted-foreground inline-flex items-center gap-1 text-xs"
                        >
                          <ShieldCheckIcon :size="14" />
                          Acked
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </template>

          <DataLoading v-else-if="activeLoading" />
          <DataNotFound
            v-else-if="activeNotFound"
            title="All Quiet"
            description="No alerts are currently firing."
          />
        </div>
      </TabsContent>

      <TabsContent
        value="history"
        class="mt-6"
      >
        <div class="space-y-4">
          <div class="flex flex-wrap-reverse items-center justify-between gap-4 sm:flex-wrap">
            <div class="flex-auto sm:flex-1">
              <InputGroup>
                <InputGroupInput
                  v-model="search"
                  placeholder="Search alerts&hellip;"
                  @input="applyFilters"
                />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <Select
                :model-value="stateFilter ?? undefined"
                @update:model-value="onStateFilter"
              >
                <SelectTrigger class="w-40">
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem :value="AlertState.FIRING">Firing</SelectItem>
                  <SelectItem :value="AlertState.RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select
                :model-value="severityFilter ?? undefined"
                @update:model-value="onSeverityFilter"
              >
                <SelectTrigger class="w-40">
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem :value="AlertSeverity.INFO">Info</SelectItem>
                  <SelectItem :value="AlertSeverity.WARNING">Warning</SelectItem>
                  <SelectItem :value="AlertSeverity.CRITICAL">Critical</SelectItem>
                  <SelectItem :value="AlertSeverity.FATAL">Fatal</SelectItem>
                </SelectContent>
              </Select>

              <Button
                v-if="hasActiveFilters"
                variant="outline"
                size="sm"
                @click="clearFilters"
              >
                Clear
              </Button>
            </div>
          </div>

          <template v-if="history.length">
            <Card>
              <CardContent class="p-0 sm:p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-16">ID</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Server</TableHead>
                      <TableHead class="hidden md:table-cell">Fired At</TableHead>
                      <TableHead class="hidden lg:table-cell">Resolved At</TableHead>
                      <TableHead class="w-28 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      v-for="alert in history"
                      :key="alert.id"
                    >
                      <TableCell class="font-mono text-xs">#{{ alert.id }}</TableCell>
                      <TableCell>
                        <AlertSeverityBadge :severity="alert.severity" />
                      </TableCell>
                      <TableCell>
                        <AlertStateBadge :state="alert.state" />
                      </TableCell>
                      <TableCell>
                        <RouterLink
                          :to="{ name: 'alerts.rules' }"
                          class="text-primary hover:underline"
                        >
                          {{ alert.rule?.name ?? `Rule #${alert.rule_id}` }}
                        </RouterLink>
                      </TableCell>
                      <TableCell>
                        <span
                          :title="alert.server_id"
                          class="text-muted-foreground font-mono text-xs"
                        >
                          {{ alert.server?.name ?? `#${alert.server_id}` }}
                        </span>
                      </TableCell>
                      <TableCell class="text-muted-foreground hidden text-xs md:table-cell">
                        {{ formatDate(alert.first_fired_at, 'DD-MM-YYYY HH:mm:ss') }}
                      </TableCell>
                      <TableCell class="text-muted-foreground hidden text-xs lg:table-cell">
                        {{
                          alert.resolved_at
                            ? formatDate(alert.resolved_at, 'DD-MM-YYYY HH:mm:ss')
                            : '—'
                        }}
                      </TableCell>
                      <TableCell class="text-right">
                        <Button
                          v-if="canWriteAlerts && !alert.acked"
                          type="button"
                          size="sm"
                          variant="outline"
                          :disabled="acking.has(alert.id)"
                          @click="onAck(alert)"
                        >
                          <CheckIcon :size="14" />
                          {{ acking.has(alert.id) ? 'Acknowledging…' : 'Ack' }}
                        </Button>
                        <span
                          v-else
                          class="text-muted-foreground inline-flex items-center gap-1 text-xs"
                        >
                          <ShieldCheckIcon :size="14" />
                          Acked
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <RoutePagination
              v-if="historyMeta && historyMeta.last_page > 1"
              :meta="historyMeta"
            />
          </template>

          <DataLoading v-else-if="historyLoading" />
          <DataNotFound v-else-if="historyNotFound" />
        </div>
      </TabsContent>
    </TabsRoot>
  </section>
</template>
