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

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

const refreshCSRFToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = getHealth()
    .then(() => {
      isRefreshing = false
      refreshPromise = null
      return true
    })
    .catch(() => {
      isRefreshing = false
      refreshPromise = null
      return false
    })

  return refreshPromise
}

const isNetworkOrParseError = (error: unknown): boolean => {
  if (!error) return false
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('Load failed') ||
    message.includes('Unexpected token') ||
    message.includes('not valid JSON') ||
    message.includes('JSON.parse') ||
    message.includes('fetch failed')
  )
}

export const useFetch = () => {
  const fetch = <T>(url: string) => {
    return useVueFetch<T>(`/api/${url}`, {
      async onFetchError(context) {
        if (!context.response || isNetworkOrParseError(context.error)) {
          context.error = new Error(
            'Unable to reach the server. Please check your connection and try again.'
          )
          return context
        }

        if (context.response.status === 401 && context.context.url !== '/api/auth/login') {
          console.warn('Session expired. Redirecting to login.')
          window.location.href = '/auth/login'
          return context
        }

        if (context.response.status === 403) {
          console.warn('CSRF token expired. Attempting refresh...')
          const refreshed = await refreshCSRFToken()

          if (!refreshed) {
            console.warn('CSRF refresh failed. Redirecting to login.')
            window.location.href = '/auth/login'
            return context
          }

          context.error = new Error(
            'Your session token was refreshed. Please try your action again.'
          )
          return context
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
          const csrfToken = getCookie('horizonx_csrf_token')
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
