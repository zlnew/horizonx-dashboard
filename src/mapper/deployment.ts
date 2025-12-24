import deployStatus from '@/constants/deployment-status'

export const deployStatusLabel = (status: string) => {
  switch (status) {
    case deployStatus.PENDING:
      return 'Pending'
    case deployStatus.DEPLOYING:
      return 'Deploying'
    case deployStatus.SUCCESS:
      return 'Success'
    case deployStatus.FAILED:
      return 'Failed'
    default:
      return ''
  }
}
