import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import AlertsApi from '@/api/Alerts'
import { ruleToRequest } from '@/mapper/alert'

const useAlertRuleStore = defineStore('alert-rule', () => {
  const api = new AlertsApi()

  const rules = ref<AlertRule[]>([])
  const meta = ref<Meta | null>(null)
  const loading = ref(false)
  const notFound = ref(false)
  const error = ref<string | null>(null)

  const fetchRules = async (criteria: AlertCriteria = {}) => {
    loading.value = true
    notFound.value = false
    error.value = null

    try {
      const res = await api.listRules<ApiResponse<AlertRule[]>>({
        ...criteria,
        paginate: true,
        limit: 10
      })

      rules.value = res.data ?? []
      meta.value = res.meta ?? null

      if (!res.data?.length) {
        notFound.value = true
      }
    } catch (err) {
      const fetchError = err as Error
      error.value = fetchError.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createRule = async (request: CreateRuleRequest) => {
    const res = await api.storeRule<ApiResponse<AlertRule>>(request)
    return res
  }

  const updateRule = async (ruleId: number, request: CreateRuleRequest) => {
    const res = await api.updateRule<ApiResponse<AlertRule>>(ruleId, request)
    return res
  }

  const deleteRule = async (ruleId: number) => {
    const res = await api.destroyRule<ApiResponse>(ruleId)
    return res
  }

  // Toggle convenience: flips enabled and persists the rest of the rule as-is.
  const toggleRule = async (rule: AlertRule) => {
    const res = await api.updateRule<ApiResponse<AlertRule>>(rule.id, {
      ...ruleToRequest(rule),
      enabled: !rule.enabled
    })

    const idx = rules.value.findIndex((r) => r.id === rule.id)
    if (idx !== -1 && res.data) {
      rules.value[idx] = res.data
    }

    return res
  }

  const silenceRule = async (ruleId: number, request: SilenceRequest) => {
    const res = await api.silenceRule<ApiResponse<AlertRule>>(ruleId, request)
    return res
  }

  // Rules applicable to a server: explicit server rules plus any global rules.
  const rulesByServer = computed(
    () => (serverId: string) =>
      rules.value.filter((r) => r.scope === 'global' || r.server_id === serverId)
  )

  const enabledRules = computed(() => rules.value.filter((r) => r.enabled))

  const cleanupState = () => {
    rules.value = []
    meta.value = null
    loading.value = false
    notFound.value = false
    error.value = null
  }

  return {
    rules,
    meta,
    loading,
    notFound,
    error,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    silenceRule,
    rulesByServer,
    enabledRules,
    cleanupState
  }
})

export default useAlertRuleStore
