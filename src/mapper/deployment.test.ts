import { describe, expect, it } from 'vitest'
import DeploymentStatus from '@/constants/deployment-status'
import { deployStatusLabel, deployStatusVariant } from '@/mapper/deployment'

describe('deployStatusLabel', () => {
  it('maps every known status to a label', () => {
    expect(deployStatusLabel(DeploymentStatus.PENDING)).toBe('Pending')
    expect(deployStatusLabel(DeploymentStatus.DEPLOYING)).toBe('Deploying')
    expect(deployStatusLabel(DeploymentStatus.SUCCESS)).toBe('Success')
    expect(deployStatusLabel(DeploymentStatus.FAILED)).toBe('Failed')
  })

  it('returns empty string for unknown status', () => {
    expect(deployStatusLabel('mystery')).toBe('')
  })
})

describe('deployStatusVariant', () => {
  it('maps every known status to its badge variant', () => {
    expect(deployStatusVariant(DeploymentStatus.FAILED)).toBe('destructive')
    expect(deployStatusVariant(DeploymentStatus.PENDING)).toBe('outline')
    expect(deployStatusVariant(DeploymentStatus.DEPLOYING)).toBe('secondary')
    expect(deployStatusVariant(DeploymentStatus.SUCCESS)).toBe('default')
  })

  it('falls back to the default variant for an unknown status', () => {
    expect(deployStatusVariant('mystery')).toBe('default')
  })
})
