export const useNumber = () => {
  const formatNumber = (number = 0, minimumFractionDigits = 0, maximumFractionDigits = 6) => {
    const options: Intl.NumberFormatOptions = {
      style: 'decimal',
      minimumFractionDigits,
      maximumFractionDigits
    }

    return new Intl.NumberFormat('id-ID', options).format(number)
  }

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    seconds %= 86400

    const hours = Math.floor(seconds / 3600)
    seconds %= 3600

    const minutes = Math.floor(seconds / 60)

    return `${days}d ${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 B'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  return {
    formatNumber,
    formatDuration,
    formatBytes
  }
}
