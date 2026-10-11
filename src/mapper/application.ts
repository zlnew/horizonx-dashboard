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

export const appStatusVariant = (status: string) => {
  switch (status) {
    case AppStatus.FAILED:
      return 'destructive'
    case AppStatus.STOPPED:
    case AppStatus.UNKNOWN:
      return 'outline'
    case AppStatus.STARTING:
    case AppStatus.RESTARTING:
    case AppStatus.DEPLOYING:
    case AppStatus.STOPPING:
      return 'secondary'
    case AppStatus.RUNNING:
      return 'default'
    default:
      return 'default'
  }
}
