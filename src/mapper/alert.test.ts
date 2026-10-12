import { describe, expect, it } from 'vitest'
import { AlertSeverity, AlertState } from '@/constants/alert'
import { alertSeverityClasses, alertStateClasses } from '@/mapper/alert'

describe('alertSeverityClasses', () => {
  it('returns the exact colour classes each severity hardcoded before', () => {
    expect(alertSeverityClasses(AlertSeverity.CRITICAL)).toBe(
      'bg-red-500/10 text-red-500 border-red-500/30'
    )
    expect(alertSeverityClasses(AlertSeverity.FATAL)).toBe(
      'bg-purple-500/10 text-purple-500 border-purple-500/30'
    )
    expect(alertSeverityClasses(AlertSeverity.WARNING)).toBe(
      'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
    )
  })

  it('falls back to the info colour classes for an unknown severity', () => {
    expect(alertSeverityClasses(AlertSeverity.INFO)).toBe(
      'bg-blue-500/10 text-blue-500 border-blue-500/30'
    )
    expect(alertSeverityClasses('mystery')).toBe(
      'bg-blue-500/10 text-blue-500 border-blue-500/30'
    )
  })
})

describe('alertStateClasses', () => {
  it('returns the exact colour classes each state hardcoded before', () => {
    expect(alertStateClasses(AlertState.FIRING)).toBe(
      'bg-red-500/10 text-red-500 border-red-500/30'
    )
  })

  it('falls back to the resolved colour classes for an unknown state', () => {
    expect(alertStateClasses(AlertState.RESOLVED)).toBe(
      'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
    )
    expect(alertStateClasses('mystery')).toBe(
      'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
    )
  })
})
