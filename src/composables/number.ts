export const useNumber = () => {
  const formatNumber = (number = 0, minimumFractionDigits = 0, maximumFractionDigits = 6) => {
    const options: Intl.NumberFormatOptions = {
      style: 'decimal',
      minimumFractionDigits,
      maximumFractionDigits,
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

  return {
    formatNumber,
    formatDuration,
  }
}
