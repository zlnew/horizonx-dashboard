import { useDateFormat } from '@vueuse/core'

export const useDate = () => {
  const formatDate = (date: Date | null = null, format = 'DD-MM-YYYY') => {
    if (!date) {
      return ''
    }

    const formatted = useDateFormat(date, format, { locales: 'id-ID' })
    return formatted.value
  }

  return {
    formatDate,
  }
}
