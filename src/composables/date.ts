import { useDateFormat } from '@vueuse/core'

export const useDate = () => {
  const formatDate = (date: Date | null = null, format = 'DD-MM-YYYY') => {
    if (!date) {
      return ''
    }

    const formatted = useDateFormat(date, format, { locales: 'id-ID' })
    return formatted.value
  }

  const formatDuration = (from: Date | null, to: Date | null) => {
    if (!from || !to) return '0m 0s'

    const diffMs = Math.abs(to.getTime() - from.getTime())

    const totalSeconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}m ${seconds}s`
  }

  return {
    formatDate,
    formatDuration
  }
}
