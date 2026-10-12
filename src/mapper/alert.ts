import { AlertScope, AlertSeverity, AlertSource, AlertState } from '@/constants/alert'

export const alertScopeLabel = (scope: string) => {
  switch (scope) {
    case AlertScope.GLOBAL:
      return 'All Servers'
    case AlertScope.SERVER:
      return 'Server'
    case AlertScope.APP:
      return 'Application'
    default:
      return scope
  }
}

export const alertSourceLabel = (source: string) => {
  switch (source) {
    case AlertSource.METRIC:
      return 'Metric'
    case AlertSource.HEALTH:
      return 'Health'
    case AlertSource.OFFLINE:
      return 'Offline'
    default:
      return source
  }
}

export const alertSeverityLabel = (severity: string) => {
  switch (severity) {
    case AlertSeverity.INFO:
      return 'Info'
    case AlertSeverity.WARNING:
      return 'Warning'
    case AlertSeverity.CRITICAL:
      return 'Critical'
    case AlertSeverity.FATAL:
      return 'Fatal'
    default:
      return severity
  }
}

export const alertStateLabel = (state: string) => {
  switch (state) {
    case AlertState.FIRING:
      return 'Firing'
    case AlertState.RESOLVED:
      return 'Resolved'
    default:
      return state
  }
}

export const alertSeverityClasses = (severity: string) => {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return 'bg-red-500/10 text-red-500 border-red-500/30'
    case AlertSeverity.FATAL:
      return 'bg-purple-500/10 text-purple-500 border-purple-500/30'
    case AlertSeverity.WARNING:
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
    default:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
  }
}

export const alertStateClasses = (state: string) => {
  switch (state) {
    case AlertState.FIRING:
      return 'bg-red-500/10 text-red-500 border-red-500/30'
    default:
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
  }
}

// Maps a rule row back into the API request shape — used by the enabled
// toggle and update flows where the full object must be re-submitted.
export const ruleToRequest = (rule: AlertRule): CreateRuleRequest => ({
  name: rule.name,
  scope: rule.scope,
  server_id: rule.server_id,
  app_id: rule.app_id,
  source: rule.source,
  metric_path: rule.metric_path,
  operator: rule.operator,
  threshold: rule.threshold,
  target_status: rule.target_status,
  for_duration: rule.for_duration,
  severity: rule.severity,
  enabled: rule.enabled
})
