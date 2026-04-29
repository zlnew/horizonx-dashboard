import { useFetch as useVueFetch } from '@vueuse/core'

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null
let isRedirecting = false

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

const redirectToLogin = async () => {
  if (isRedirecting) return
  isRedirecting = true

  console.warn('Redirecting to login...')
  window.location.href = '/auth/login'
}

const refreshCSRFToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true

  refreshPromise = getHealth()
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      isRefreshing = false
      refreshPromise = null
    })

  return refreshPromise
}

const isNetworkOrParseError = (error: unknown): boolean => {
  if (!error) return false
  const msg = error instanceof Error ? error.message : String(error)

  return [
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    'Unexpected token',
    'not valid JSON',
    'JSON.parse',
    'fetch failed'
  ].some((e) => msg.includes(e))
}

export const useFetch = () => {
  const fetch = <T>(url: string) => {
    return useVueFetch<T>(`/api/${url}`, {
      async onFetchError(context) {
        const status = context.response?.status
        const requestUrl = context.context.url

        // --- 401
        if (status === 401 && !requestUrl.includes('/auth/login')) {
          await redirectToLogin()
          return {
            ...context,
            error: new Error('Session expired. Please login again.')
          }
        }

        // --- 403 (CSRF Expired)
        if (status === 403) {
          const refreshed = await refreshCSRFToken()

          if (!refreshed) {
            await redirectToLogin()
            return {
              ...context,
              error: new Error('Session expired. Please login again.')
            }
          }

          context.error = new Error('Session refreshed. Please click again to continue.')
          return context
        }

        // --- Network or Parse errors
        if (!context.response || isNetworkOrParseError(context.error)) {
          context.error = new Error(
            'Unable to reach the server. Please check your connection and try again.'
          )
          return context
        }

        if (context.error) {
          const message = context.data?.message || context.data?.error || context.error.message
          context.error = new Error(message)
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
