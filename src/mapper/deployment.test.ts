import { describe, expect, it } from 'vitest'
import DeploymentStatus from '@/constants/deployment-status'
import { deployStatusLabel } from '@/mapper/deployment'

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
