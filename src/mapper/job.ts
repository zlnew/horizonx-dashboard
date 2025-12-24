import JobStatus from '@/constants/job-status'
import JobType from '@/constants/job-type'

export const jobTypeLabel = (type: string) => {
  switch (type) {
    case JobType.DEPLOY_APP:
      return 'Deploy Application'
    case JobType.START_APP:
      return 'Start Application'
    case JobType.STOP_APP:
      return 'Stop Application'
    case JobType.RESTART_APP:
      return 'Restart Application'
  }
}

export const jobStatusLabel = (status: string) => {
  switch (status) {
    case JobStatus.FAILED:
      return 'Failed'
    case JobStatus.QUEUED:
      return 'Queued'
    case JobStatus.RUNNING:
      return 'Running'
    case JobStatus.SUCCESS:
      return 'Success'
    default:
      return ''
  }
}
