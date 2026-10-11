import { describe, expect, it } from 'vitest'
import JobStatus from '@/constants/job-status'
import { jobStatusVariant } from '@/mapper/job'

describe('jobStatusVariant', () => {
  it('maps every known status to its badge variant', () => {
    expect(jobStatusVariant(JobStatus.FAILED)).toBe('destructive')
    expect(jobStatusVariant(JobStatus.EXPIRED)).toBe('destructive')
    expect(jobStatusVariant(JobStatus.QUEUED)).toBe('outline')
    expect(jobStatusVariant(JobStatus.RUNNING)).toBe('secondary')
    expect(jobStatusVariant(JobStatus.SUCCESS)).toBe('default')
  })

  it('falls back to the default variant for an unknown status', () => {
    expect(jobStatusVariant('mystery')).toBe('default')
  })
})
