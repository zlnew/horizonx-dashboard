<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { BellRingIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AlertSeverityBadge from '@/components/AlertSeverityBadge.vue'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import PageHeader from '@/components/PageHeader.vue'
import RoutePagination from '@/components/RoutePagination.vue'
import AlertRuleCreateDialog from '@/components/dialogs/AlertRuleCreateDialog.vue'
import AlertRuleDeleteDialog from '@/components/dialogs/AlertRuleDeleteDialog.vue'
import AlertRuleUpdateDialog from '@/components/dialogs/AlertRuleUpdateDialog.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
import { usePageMeta } from '@/composables/page-meta'
import { AlertScope, AlertSeverity } from '@/constants/alert'
import Permission from '@/constants/permission'
import { alertScopeLabel, alertSourceLabel } from '@/mapper/alert'
import useAlertRuleStore from '@/stores/alert-rule'
import useAuthStore from '@/stores/auth'

type Criteria = AlertCriteria

const route = useRoute()
const router = useRouter()

const ruleStore = useAlertRuleStore()
const authStore = useAuthStore()
const { can } = storeToRefs(authStore)

const { rules, meta, loading, notFound } = storeToRefs(ruleStore)

const canReadAlerts = computed(() => can.value(Permission.ALERT_READ))
const canWriteAlerts = computed(() => can.value(Permission.ALERT_WRITE))

usePageMeta({
  title: 'Alert Rules',
  breadcrumb: [
    {
      label: 'Alert Rules',
      to: { name: 'alerts.rules' }
    }
  ]
})

const search = ref('')
const scopeFilter = ref<string | null>(null)
const severityFilter = ref<string | null>(null)
const enabledFilter = ref<string | null>(null)

const criteria = computed<Criteria>(() => ({ ...route.query }))

const createOpen = ref(false)
const updateOpen = ref(false)
const deleteOpen = ref(false)
const selectedRule = ref<AlertRule | null>(null)

const toggling = new Set<number>()

onMounted(() => {
  fetchRules(criteria.value)
})

onBeforeRouteUpdate((to) => {
  const c = to.query as Criteria
  search.value = c.search ?? ''
  fetchRules(c)
})

onUnmounted(() => {
  ruleStore.cleanupState()
})

const fetchRules = async (criteria: Criteria) => {
  if (!canReadAlerts.value) {
    return
  }

  try {
    await ruleStore.fetchRules({
      ...criteria,
      paginate: true,
      limit: 10
    })
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const applyFilters = useDebounceFn(() => {
  const q: Record<string, string> = {}
  if (search.value) q.search = search.value
  if (scopeFilter.value) q.scope = scopeFilter.value
  if (severityFilter.value) q.severity = severityFilter.value
  if (enabledFilter.value) q.enabled = enabledFilter.value
  router.push({ query: q })
}, 300)

const onScopeFilter = (value: unknown) => {
  scopeFilter.value = value === 'all' ? null : String(value ?? '')
  applyFilters()
}

const onSeverityFilter = (value: unknown) => {
  severityFilter.value = value === 'all' ? null : String(value ?? '')
  applyFilters()
}

const onEnabledFilter = (value: unknown) => {
  enabledFilter.value = value === 'all' ? null : String(value ?? '')
  applyFilters()
}

watch(
  () => route.query,
  (q) => {
    scopeFilter.value = (q.scope as string) ?? null
    severityFilter.value = (q.severity as string) ?? null
    enabledFilter.value = (q.enabled as string) ?? null
  },
  { immediate: true }
)

const clearFilters = () => {
  search.value = ''
  scopeFilter.value = null
  severityFilter.value = null
  enabledFilter.value = null
  router.push({ query: {} })
}

const hasActiveFilters = computed(
  () => !!search.value || !!scopeFilter.value || !!severityFilter.value || !!enabledFilter.value
)

watch(
  () => route.query,
  (q) => {
    scopeFilter.value = (q.scope as string) ?? null
    severityFilter.value = (q.severity as string) ?? null
    enabledFilter.value = (q.enabled as string) ?? null
  },
  { immediate: true }
)

const openCreate = () => {
  createOpen.value = true
}

const openUpdate = (rule: AlertRule) => {
  selectedRule.value = rule
  updateOpen.value = true
}

const openDelete = (rule: AlertRule) => {
  selectedRule.value = rule
  deleteOpen.value = true
}

const onToggle = async (rule: AlertRule) => {
  if (toggling.has(rule.id)) {
    return
  }

  toggling.add(rule.id)

  try {
    const res = await ruleStore.toggleRule(rule)
    toast.success(res.message ?? `Rule ${rule.enabled ? 'disabled' : 'enabled'}`)
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    toggling.delete(rule.id)
  }
}

const silenceHours = [1, 6, 24, 168]

const onSilence = async (rule: AlertRule, hours: number) => {
  try {
    const silencedUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    const res = await ruleStore.silenceRule(rule.id, { silenced_until: silencedUntil })
    toast.success(res.message ?? `Rule silenced for ${hours} hour${hours > 1 ? 's' : ''}`)
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <section>
    <PageHeader
      :icon="BellRingIcon"
      title="Alert Rules"
      description="Configure conditions that fire alerts across servers and applications"
    >
      <template #actions>
        <div
          v-if="canWriteAlerts"
          class="flex items-center gap-2"
        >
          <Button
            type="button"
            class="shadow-primary/10 rounded-full shadow-lg transition-transform active:scale-95"
            @click="openCreate"
          >
            <PlusIcon />
            Create Rule
          </Button>
        </div>
      </template>
    </PageHeader>
  </section>

  <section class="mt-12 space-y-4">
    <div class="flex flex-wrap-reverse items-center justify-between gap-4 sm:flex-wrap">
      <div class="flex-auto sm:flex-1">
        <InputGroup>
          <InputGroupInput
            v-model="search"
            placeholder="Search rules&hellip;"
            @input="applyFilters"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Select
          :model-value="scopeFilter ?? undefined"
          @update:model-value="onScopeFilter"
        >
          <SelectTrigger class="w-40">
            <SelectValue placeholder="All scopes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scopes</SelectItem>
            <SelectItem :value="AlertScope.GLOBAL">All servers</SelectItem>
            <SelectItem :value="AlertScope.SERVER">Server</SelectItem>
            <SelectItem :value="AlertScope.APP">Application</SelectItem>
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

        <Select
          :model-value="enabledFilter ?? undefined"
          @update:model-value="onEnabledFilter"
        >
          <SelectTrigger class="w-40">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            <SelectItem value="1">Enabled</SelectItem>
            <SelectItem value="0">Disabled</SelectItem>
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

    <template v-if="rules.length">
      <Card>
        <CardContent class="p-0 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead class="hidden md:table-cell">For</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead class="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="rule in rules"
                :key="rule.id"
              >
                <TableCell>
                  <div class="flex flex-col">
                    <span class="font-semibold">{{ rule.name }}</span>
                    <span
                      v-if="rule.source === 'metric' && rule.metric_path"
                      class="text-muted-foreground font-mono text-xs"
                    >
                      {{ rule.metric_path }} {{ rule.operator }} {{ rule.threshold }}
                    </span>
                    <span
                      v-else-if="rule.source === 'health' && rule.target_status"
                      class="text-muted-foreground text-xs"
                    >
                      target: {{ rule.target_status }}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span class="text-muted-foreground text-sm">
                    {{ alertScopeLabel(rule.scope) }}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    class="bg-accent/50 border-border/50 rounded-md px-2 py-0.5 text-xs font-medium"
                  >
                    {{ alertSourceLabel(rule.source) }}
                  </span>
                </TableCell>
                <TableCell>
                  <AlertSeverityBadge :severity="rule.severity" />
                </TableCell>
                <TableCell class="text-muted-foreground hidden text-sm md:table-cell">
                  {{ rule.for_duration > 0 ? `${rule.for_duration}s` : 'Instant' }}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="rule.enabled"
                    :aria-label="`Toggle ${rule.name}`"
                    :disabled="toggling.has(rule.id)"
                    class="data-[state=checked]:bg-primary bg-input relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    :data-state="rule.enabled ? 'checked' : 'unchecked'"
                    @click="onToggle(rule)"
                  >
                    <span
                      class="bg-background pointer-events-none block size-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
                      :data-state="rule.enabled ? 'checked' : 'unchecked'"
                    />
                  </button>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <template v-if="canWriteAlerts">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        class="border-border/50 bg-accent/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30 rounded-lg border transition-all"
                        aria-label="Edit rule"
                        :title="'Edit'"
                        @click="openUpdate(rule)"
                      >
                        <PencilIcon :size="16" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            class="border-border/50 bg-accent/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30 rounded-lg border transition-all"
                            aria-label="More actions"
                            :title="'More'"
                          >
                            <span class="text-sm font-black">⋯</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Silence</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                v-for="hours in silenceHours"
                                :key="hours"
                                @click="onSilence(rule, hours)"
                              >
                                {{ hours }} hour{{ hours > 1 ? 's' : '' }}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            class="text-destructive focus:text-destructive"
                            @click="openDelete(rule)"
                          >
                            <TrashIcon :size="14" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </template>

                    <span
                      v-else
                      class="text-muted-foreground text-xs"
                      >—</span
                    >
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoutePagination
        v-if="meta && meta.last_page > 1"
        :meta="meta"
      />
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else-if="notFound" />
  </section>

  <AlertRuleCreateDialog
    v-model:open="createOpen"
    @success="fetchRules(criteria)"
  />
  <AlertRuleUpdateDialog
    v-model:open="updateOpen"
    :rule="selectedRule"
    @success="fetchRules(criteria)"
  />
  <AlertRuleDeleteDialog
    v-model:open="deleteOpen"
    :rule="selectedRule"
    @success="fetchRules(criteria)"
  />
</template>
