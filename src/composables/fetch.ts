import { useFetch as useVueFetch } from '@vueuse/core'

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export const getHealth = async () => {
  const response = await fetch('/api/health', {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`)
  }

  return true
}

export const useFetch = () => {
  const fetch = <T>(url: string) => {
    return useVueFetch<T>(`/api/${url}`, {
      async onFetchError(context) {
        if (context.response?.status === 401) {
          console.warn('⛔ Session expired. Please login again.')
          window.location.href = '/auth/login'
        }

        if (context.response?.status === 403) {
          console.warn('⚠️ CSRF Token expired/missing. Refreshing page to fix...')
          try {
            await getHealth()
            console.log('✅ Token refreshed. User needs to retry.')
          } catch (e) {
            console.error('💀 Refresh failed. Reloading page.', e)
            window.location.reload()
          }
        }

        if (context.error) {
          if (context.data && context.data.message) {
            context.error = new Error(context.data.message)
          }
        }

        return context
      },

      beforeFetch({ options }) {
        options.credentials = 'include'

        const method = options.method?.toUpperCase() || 'GET'
        const unsafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH']

        if (unsafeMethods.includes(method)) {
          const csrfToken = getCookie('csrf_token')
          if (csrfToken) {
            options.headers = {
              ...options.headers,
              'X-CSRF-Token': csrfToken
            }
          }
        }

        return {
          options
        }
      },
      updateDataOnError: true
    })
  }

  return { fetch }
}
