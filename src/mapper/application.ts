import AppStatus from '@/constants/application-status'

export const appStatusLabel = (status: string) => {
  switch (status) {
    case AppStatus.DEPLOYING:
      return 'Deploying'
    case AppStatus.STARTING:
      return 'Starting'
    case AppStatus.STOPPING:
      return 'Stopping'
    case AppStatus.RESTARTING:
      return 'Restarting'
    case AppStatus.RUNNING:
      return 'Running'
    case AppStatus.STOPPED:
      return 'Stopped'
    case AppStatus.FAILED:
      return 'Failed'
    case AppStatus.UNKNOWN:
      return 'Unknown'
    default:
      return ''
  }
}
