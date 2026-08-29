export const AlertScope = {
  GLOBAL: 'global',
  SERVER: 'server',
  APP: 'app'
} as const

export const AlertSource = {
  METRIC: 'metric',
  HEALTH: 'health',
  OFFLINE: 'offline'
} as const

export const AlertSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
  FATAL: 'fatal'
} as const

export const AlertState = {
  FIRING: 'firing',
  RESOLVED: 'resolved'
} as const
