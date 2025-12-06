import { useFetch as useVueFetch } from '@vueuse/core'
import useApp from '@/composables/app'

export const useFetch = () => {
  const fetch = <T>(url: string) => {
    const { apiURL } = useApp()

    return useVueFetch<T>(`${apiURL}/${url}`, {
      updateDataOnError: true,
      onFetchError(context) {
        if (context.error) {
          if (context.data && context.data.message) {
            context.error = new Error(context.data.message)
          }
        }

        return context
      },
    })
  }

  return { fetch }
}
