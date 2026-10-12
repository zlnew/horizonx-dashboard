import { describe, expect, it } from 'vitest'
import ApplicationStatus from '@/constants/application-status'
import { appStatusVariant } from '@/mapper/application'

describe('appStatusVariant', () => {
  it('maps every known status to its badge variant', () => {
    expect(appStatusVariant(ApplicationStatus.FAILED)).toBe('destructive')
    expect(appStatusVariant(ApplicationStatus.STOPPED)).toBe('outline')
    expect(appStatusVariant(ApplicationStatus.UNKNOWN)).toBe('outline')
    expect(appStatusVariant(ApplicationStatus.STARTING)).toBe('secondary')
    expect(appStatusVariant(ApplicationStatus.RESTARTING)).toBe('secondary')
    expect(appStatusVariant(ApplicationStatus.DEPLOYING)).toBe('secondary')
    expect(appStatusVariant(ApplicationStatus.STOPPING)).toBe('secondary')
    expect(appStatusVariant(ApplicationStatus.RUNNING)).toBe('default')
  })

  it('falls back to the default variant for an unknown status', () => {
    expect(appStatusVariant('mystery')).toBe('default')
  })
})
