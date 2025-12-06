export const useNumber = () => {
  const formatNumber = (number = 0, minimumFractionDigits = 0, maximumFractionDigits = 6) => {
    const options: Intl.NumberFormatOptions = {
      style: 'decimal',
      minimumFractionDigits,
      maximumFractionDigits,
    }

    return new Intl.NumberFormat('id-ID', options).format(number)
  }

  return {
    formatNumber,
  }
}
