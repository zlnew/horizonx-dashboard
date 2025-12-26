import JobStatus from '@/constants/job-status'
import JobType from '@/constants/job-type'

export const jobTypeLabel = (type: string) => {
  switch (type) {
    case JobType.APP_DEPLOY:
      return 'Deploying Application'
    case JobType.APP_START:
      return 'Starting Application'
    case JobType.APP_STOP:
      return 'Stopping Application'
    case JobType.APP_RESTART:
      return 'Restarting Application'
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
