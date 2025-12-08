import { useFetch as useVueFetch } from '@vueuse/core'
import useApp from '@/composables/app'

export const useFetch = () => {
  const fetch = <T>(url: string) => {
    const { apiURL } = useApp()

    return useVueFetch<T>(`${apiURL}/${url}`, {
      beforeFetch({ options }) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer`
        }

        return {
          options
        }
      },
      updateDataOnError: true,
      onFetchError(context) {
        if (context.error) {
          if (context.data && context.data.message) {
            context.error = new Error(context.data.message)
          }
        }

        return context
      }
    })
  }

  return { fetch }
}
