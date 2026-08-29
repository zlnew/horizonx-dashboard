type AlertRuleScope = 'global' | 'server' | 'app'
type AlertRuleSource = 'metric' | 'health' | 'offline'
type AlertRuleOperator = '>' | '>=' | '<' | '<='
type AlertRuleSeverity = 'info' | 'warning' | 'critical' | 'fatal'
type AlertState = 'firing' | 'resolved'

type AlertRule = {
  id: number
  name: string
  scope: AlertRuleScope
  server_id: string | null
  app_id: number | null
  source: AlertRuleSource
  metric_path: string | null
  operator: AlertRuleOperator | null
  threshold: number | null
  target_status: string | null
  for_duration: number
  severity: AlertRuleSeverity
  enabled: boolean
  created_at: string
  updated_at: string

  server?: Server | null
  app?: Application | null
}

type Alert = {
  id: number
  rule_id: number
  server_id: string
  app_id: number | null
  severity: AlertRuleSeverity
  state: AlertState
  value: number | null
  message: string
  acked: boolean
  silenced_until: string | null
  first_fired_at: string
  resolved_at: string | null
  created_at: string

  rule?: AlertRule | null
  server?: Server | null
  app?: Application | null
}

type AlertCriteria = Criteria & {
  scope?: string | null
  source?: string | null
  severity?: string | null
  state?: string | null
  enabled?: boolean | null
  acked?: boolean | null
  server_id?: string | null
  app_id?: number | null
}

type CreateRuleRequest = {
  name: string
  scope: AlertRuleScope
  server_id: string | null
  app_id: number | null
  source: AlertRuleSource
  metric_path: string | null
  operator: AlertRuleOperator | null
  threshold: number | null
  target_status: string | null
  for_duration: number
  severity: AlertRuleSeverity
  enabled: boolean
}

type SilenceRequest = {
  silenced_until: string | null
}
