<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import ApplicationApi from '@/api/Application'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AlertScope, AlertSeverity, AlertSource } from '@/constants/alert'
import useAlertRuleStore from '@/stores/alert-rule'
import useAppStore from '@/stores/app'

const props = defineProps<{
  open?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const appStore = useAppStore()
const { servers } = storeToRefs(appStore)
const ruleStore = useAlertRuleStore()

const applications = ref<Application[]>([])
const applicationsLoading = ref(false)
const saving = ref(false)
const submitError = ref<string | null>(null)

const healthTargetStatuses = ['failed', 'stopped', 'unknown']

const isMetric = computed(() => values.source === AlertSource.METRIC)
const isHealth = computed(() => values.source === AlertSource.HEALTH)
const isServerScope = computed(() => values.scope === AlertScope.SERVER)
const isAppScope = computed(() => values.scope === AlertScope.APP)

const ruleFormSchema = toTypedSchema(
  z
    .object({
      name: z.string().min(1, 'Name is required'),
      scope: z.enum([AlertScope.GLOBAL, AlertScope.SERVER, AlertScope.APP]),
      server_id: z.string().nullable().optional(),
      app_id: z.string().nullable().optional(),
      source: z.enum([AlertSource.METRIC, AlertSource.HEALTH, AlertSource.OFFLINE]),
      metric_path: z.string().nullable().optional(),
      operator: z.string().nullable().optional(),
      threshold: z.string().nullable().optional(),
      target_status: z.string().nullable().optional(),
      for_duration: z.string().nullable().optional(),
      severity: z.enum([
        AlertSeverity.INFO,
        AlertSeverity.WARNING,
        AlertSeverity.CRITICAL,
        AlertSeverity.FATAL
      ]),
      enabled: z.boolean().default(true)
    })
    .superRefine((data, ctx) => {
      if (data.source === AlertSource.METRIC) {
        if (!data.metric_path?.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['metric_path'],
            message: 'Metric path is required'
          })
        }
        if (!data.operator) {
          ctx.addIssue({ code: 'custom', path: ['operator'], message: 'Operator is required' })
        }
        if (data.threshold === null || data.threshold === undefined || data.threshold === '') {
          ctx.addIssue({ code: 'custom', path: ['threshold'], message: 'Threshold is required' })
        }
      }

      if (data.source === AlertSource.HEALTH && !data.target_status) {
        ctx.addIssue({
          code: 'custom',
          path: ['target_status'],
          message: 'Target status is required'
        })
      }

      if (data.scope === AlertScope.SERVER && !data.server_id) {
        ctx.addIssue({ code: 'custom', path: ['server_id'], message: 'Server is required' })
      }

      if (data.scope === AlertScope.APP && !data.app_id) {
        ctx.addIssue({ code: 'custom', path: ['app_id'], message: 'Application is required' })
      }
    })
)

const { values, errors, defineField, handleSubmit, resetForm, setFieldValue } = useForm({
  validationSchema: ruleFormSchema,
  initialValues: {
    name: '',
    scope: AlertScope.GLOBAL,
    server_id: '',
    app_id: '',
    source: AlertSource.METRIC,
    metric_path: '',
    operator: '',
    threshold: '',
    target_status: '',
    for_duration: '0',
    severity: AlertSeverity.WARNING,
    enabled: true
  }
})

const [name, nameAttrs] = defineField('name')

// Select/switch/input change handlers. reka-ui emits a broad AcceptableValue
// type, so handlers accept `unknown` and normalize to the schema's string
// fields; enum fields are cast back to their literal union types.
const onScopeChange = (value: unknown) =>
  setFieldValue('scope', String(value ?? '') as AlertRuleScope)
const onServerChange = (value: unknown) => setFieldValue('server_id', String(value ?? ''))
const onAppChange = (value: unknown) => setFieldValue('app_id', String(value ?? ''))
const onSourceChange = (value: unknown) =>
  setFieldValue('source', String(value ?? '') as AlertRuleSource)
const onSeverityChange = (value: unknown) =>
  setFieldValue('severity', String(value ?? '') as AlertRuleSeverity)
const onOperatorChange = (value: unknown) => setFieldValue('operator', String(value ?? ''))
const onTargetStatusChange = (value: unknown) => setFieldValue('target_status', String(value ?? ''))
const onMetricPathChange = (value: unknown) => setFieldValue('metric_path', String(value ?? ''))
const onThresholdChange = (value: unknown) => setFieldValue('threshold', String(value ?? ''))
const onForDurationChange = (value: unknown) => setFieldValue('for_duration', String(value ?? ''))
const onEnabledChange = (value: unknown) => setFieldValue('enabled', Boolean(value))

const loadApplications = async () => {
  if (!appStore.serverID) {
    applications.value = []
    return
  }

  applicationsLoading.value = true

  try {
    const res = await new ApplicationApi().get<ApiResponse<Application[]>>({
      server_id: appStore.serverID,
      paginate: false
    })
    applications.value = res.data ?? []
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
    applications.value = []
  } finally {
    applicationsLoading.value = false
  }
}

// Clear conditional fields when the source/scope changes so stale values
// never leak into the payload of an unrelated rule type.
watch(
  () => values.source,
  (source) => {
    if (source !== AlertSource.METRIC) {
      setFieldValue('metric_path', '')
      setFieldValue('operator', '')
      setFieldValue('threshold', '')
    }

    if (source !== AlertSource.HEALTH) {
      setFieldValue('target_status', '')
    }
  }
)

watch(
  () => values.scope,
  (scope) => {
    if (scope !== AlertScope.SERVER) {
      setFieldValue('server_id', '')
    }

    if (scope !== AlertScope.APP) {
      setFieldValue('app_id', '')
    } else {
      loadApplications()
    }
  }
)

watch(
  () => props.open,
  (open) => {
    if (open) {
      submitError.value = null
      resetForm()
    }
  }
)

const close = () => {
  emit('update:open', false)
}

const buildPayload = (formValues: typeof values): CreateRuleRequest => {
  return {
    name: (formValues.name ?? '').trim(),
    scope: (formValues.scope ?? AlertScope.GLOBAL) as AlertRuleScope,
    server_id: isServerScope.value ? formValues.server_id || null : null,
    app_id: isAppScope.value && formValues.app_id ? Number(formValues.app_id) : null,
    source: (formValues.source ?? AlertSource.METRIC) as AlertRuleSource,
    metric_path:
      isMetric.value && formValues.metric_path?.trim() ? formValues.metric_path.trim() : null,
    operator: isMetric.value ? (formValues.operator as AlertRuleOperator) || null : null,
    threshold:
      isMetric.value && formValues.threshold !== undefined && formValues.threshold !== ''
        ? Number(formValues.threshold)
        : null,
    target_status: isHealth.value ? formValues.target_status || null : null,
    for_duration: Number(formValues.for_duration) || 0,
    severity: (formValues.severity ?? AlertSeverity.WARNING) as AlertRuleSeverity,
    enabled: formValues.enabled ?? true
  }
}

const onSubmit = handleSubmit(async (formValues) => {
  saving.value = true
  submitError.value = null

  try {
    const res = await ruleStore.createRule(buildPayload(formValues))
    toast.success(res.message ?? 'Alert rule created successfully')
    emit('success')
    close()
  } catch (error) {
    const fetchError = error as Error
    submitError.value = fetchError.message
  } finally {
    saving.value = false
  }
})
</script>

<template>
  <Dialog
    :open="props.open"
    @update:open="(v) => emit('update:open', v)"
  >
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Create Alert Rule</DialogTitle>
        <DialogDescription>
          Define when HorizonX should fire an alert and how severe it is.
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="onSubmit"
      >
        <div
          v-if="submitError"
          class="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
        >
          {{ submitError }}
        </div>

        <FormItem>
          <FormLabel>Name</FormLabel>
          <Input
            v-model="name"
            v-bind="nameAttrs"
            placeholder="High CPU usage"
          />
          <p
            v-if="errors.name"
            class="text-destructive text-sm"
          >
            {{ errors.name }}
          </p>
        </FormItem>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormItem>
            <FormLabel>Scope</FormLabel>
            <Select
              :model-value="values.scope"
              @update:model-value="onScopeChange"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="AlertScope.GLOBAL">All servers</SelectItem>
                <SelectItem :value="AlertScope.SERVER">Specific server</SelectItem>
                <SelectItem :value="AlertScope.APP">Specific application</SelectItem>
              </SelectContent>
            </Select>
            <p
              v-if="errors.scope"
              class="text-destructive text-sm"
            >
              {{ errors.scope }}
            </p>
          </FormItem>

          <FormItem v-if="isServerScope">
            <FormLabel>Server</FormLabel>
            <Select
              :model-value="values.server_id ?? ''"
              @update:model-value="onServerChange"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select server" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="server in servers"
                  :key="server.id"
                  :value="server.id"
                >
                  {{ server.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p
              v-if="errors.server_id"
              class="text-destructive text-sm"
            >
              {{ errors.server_id }}
            </p>
          </FormItem>

          <FormItem v-if="isAppScope">
            <FormLabel>Application</FormLabel>
            <Select
              :model-value="values.app_id ?? ''"
              :disabled="applicationsLoading"
              @update:model-value="onAppChange"
            >
              <SelectTrigger>
                <SelectValue
                  :placeholder="applicationsLoading ? 'Loading…' : 'Select application'"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="app in applications"
                  :key="app.id"
                  :value="String(app.id)"
                >
                  {{ app.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p
              v-if="errors.app_id"
              class="text-destructive text-sm"
            >
              {{ errors.app_id }}
            </p>
          </FormItem>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormItem>
            <FormLabel>Source</FormLabel>
            <Select
              :model-value="values.source"
              @update:model-value="onSourceChange"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="AlertSource.METRIC">Metric</SelectItem>
                <SelectItem :value="AlertSource.HEALTH">Health</SelectItem>
                <SelectItem :value="AlertSource.OFFLINE">Offline</SelectItem>
              </SelectContent>
            </Select>
            <p
              v-if="errors.source"
              class="text-destructive text-sm"
            >
              {{ errors.source }}
            </p>
          </FormItem>

          <FormItem>
            <FormLabel>Severity</FormLabel>
            <Select
              :model-value="values.severity"
              @update:model-value="onSeverityChange"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="AlertSeverity.INFO">Info</SelectItem>
                <SelectItem :value="AlertSeverity.WARNING">Warning</SelectItem>
                <SelectItem :value="AlertSeverity.CRITICAL">Critical</SelectItem>
                <SelectItem :value="AlertSeverity.FATAL">Fatal</SelectItem>
              </SelectContent>
            </Select>
            <p
              v-if="errors.severity"
              class="text-destructive text-sm"
            >
              {{ errors.severity }}
            </p>
          </FormItem>
        </div>

        <template v-if="isMetric">
          <FormItem>
            <FormLabel>Metric path</FormLabel>
            <Input
              :model-value="values.metric_path ?? ''"
              placeholder="cpu.usage_percent"
              @update:model-value="onMetricPathChange"
            />
            <p
              v-if="errors.metric_path"
              class="text-destructive text-sm"
            >
              {{ errors.metric_path }}
            </p>
          </FormItem>

          <div class="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Operator</FormLabel>
              <Select
                :model-value="values.operator ?? ''"
                @update:model-value="onOperatorChange"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="&gt;">&gt;</SelectItem>
                  <SelectItem value="&gt;=">&gt;=</SelectItem>
                  <SelectItem value="&lt;">&lt;</SelectItem>
                  <SelectItem value="&lt;=">&lt;=</SelectItem>
                </SelectContent>
              </Select>
              <p
                v-if="errors.operator"
                class="text-destructive text-sm"
              >
                {{ errors.operator }}
              </p>
            </FormItem>

            <FormItem>
              <FormLabel>Threshold</FormLabel>
              <Input
                :model-value="values.threshold ?? ''"
                type="number"
                step="any"
                placeholder="90"
                @update:model-value="onThresholdChange"
              />
              <p
                v-if="errors.threshold"
                class="text-destructive text-sm"
              >
                {{ errors.threshold }}
              </p>
            </FormItem>
          </div>
        </template>

        <FormItem v-if="isHealth">
          <FormLabel>Target status</FormLabel>
          <Select
            :model-value="values.target_status ?? ''"
            @update:model-value="onTargetStatusChange"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="status in healthTargetStatuses"
                :key="status"
                :value="status"
              >
                {{ status }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p
            v-if="errors.target_status"
            class="text-destructive text-sm"
          >
            {{ errors.target_status }}
          </p>
        </FormItem>

        <FormItem>
          <FormLabel>For duration (seconds)</FormLabel>
          <Input
            :model-value="values.for_duration ?? '0'"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            @update:model-value="onForDurationChange"
          />
          <p
            v-if="errors.for_duration"
            class="text-destructive text-sm"
          >
            {{ errors.for_duration }}
          </p>
        </FormItem>

        <div class="border-border/50 flex items-center justify-between rounded-lg border p-4">
          <div class="space-y-1">
            <FormLabel class="text-sm font-medium">Enabled</FormLabel>
            <p class="text-muted-foreground text-xs">Evaluate this rule immediately</p>
          </div>
          <SwitchRoot
            :checked="values.enabled"
            aria-label="Enable rule"
            class="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:ring-ring/50 relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-colors outline-none focus-visible:ring focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            @update:checked="onEnabledChange"
          >
            <SwitchThumb
              class="bg-background pointer-events-none block size-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            />
          </SwitchRoot>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            :disabled="saving"
            @click="close"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="saving"
          >
            {{ saving ? 'Creating…' : 'Create Rule' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
