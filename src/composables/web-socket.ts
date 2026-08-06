import { ref } from 'vue'
import useApp from '@/composables/app'

type OutgoingMessage = {
  type: 'subscribe' | 'unsubscribe' | 'ping'
  channel?: string
}

type IncomingMessage<T = unknown> = {
  type: string
  event: string
  channel: string
  payload: T
}

type InternalHandler = (msg: IncomingMessage<unknown>) => void

// Heartbeat/watchdog tuning. The server pongs our application-level pings
// (protocol pings are invisible to browser JS), so we can prove liveness:
//   - ping every 25s
//   - if no traffic (any message) for 75s, force-close -> reconnect with backoff
//   - abort a handshake stuck CONNECTING after 10s
const HEARTBEAT_INTERVAL_MS = 25_000
const STALE_AFTER_MS = 75_000
const WATCHDOG_INTERVAL_MS = 15_000
const CONNECT_TIMEOUT_MS = 10_000
const MAX_QUEUE = 100

// `socket` is exposed for UI reactivity, but identity checks MUST use
// `activeSocket`: Vue wraps the value in a reactive Proxy, so comparing the
// ref's .value against a raw WebSocket instance is always false.
const socket = ref<WebSocket | null>(null)
let activeSocket: WebSocket | null = null

const connected = ref(false)
const listeners = new Map<string, Set<(msg: IncomingMessage<unknown>) => void>>()
const messageQueue: OutgoingMessage[] = []

let reconnectAttempts = 0
let reconnectTimer: number | null = null
let explicitClose = false
let lastActivityAt = 0
let heartbeatTimer: number | null = null
let watchdogTimer: number | null = null
let connectTimer: number | null = null

export default function useWebSocket() {
  const { wsURL } = useApp()

  const clearTimers = () => {
    if (heartbeatTimer) {
      window.clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    if (watchdogTimer) {
      window.clearInterval(watchdogTimer)
      watchdogTimer = null
    }
    if (connectTimer) {
      window.clearTimeout(connectTimer)
      connectTimer = null
    }
  }

  const connect = (): Promise<void> => {
    const current = activeSocket

    // A socket that is OPEN but stale is dead (half-open TCP, lost FIN,
    // tunnel dropped): close it so the onclose path reconnects instead of
    // early-returning forever.
    if (current?.readyState === WebSocket.OPEN) {
      if (Date.now() - lastActivityAt > STALE_AFTER_MS) {
        console.warn('🔌 WS socket stale, forcing reconnect')
        current.close()
      }
      return Promise.resolve()
    }

    // A socket stuck CONNECTING is also broken: the connectTimer aborts it.
    if (current?.readyState === WebSocket.CONNECTING) {
      return Promise.resolve()
    }

    explicitClose = false
    const sock = new WebSocket(wsURL)
    activeSocket = sock
    socket.value = sock

    // Abort a handshake that never completes.
    if (connectTimer) window.clearTimeout(connectTimer)
    connectTimer = window.setTimeout(() => {
      if (sock.readyState === WebSocket.CONNECTING) {
        console.warn('🔌 WS handshake timed out, closing')
        sock.close()
      }
    }, CONNECT_TIMEOUT_MS)

    return new Promise((resolve) => {
      sock.onopen = () => {
        // Only the current socket may act; late events from a replaced
        // socket must not touch the new connection.
        if (activeSocket !== sock) return

        console.log('⚡ WS Connected')
        connected.value = true
        reconnectAttempts = 0
        lastActivityAt = Date.now()

        if (connectTimer) {
          window.clearTimeout(connectTimer)
          connectTimer = null
        }

        startHeartbeat()
        startWatchdog()

        resubscribeAll()

        while (messageQueue.length > 0) {
          const msg = messageQueue.shift()
          if (msg) sendRaw(msg)
        }

        resolve()
      }

      sock.onmessage = (event) => {
        if (activeSocket !== sock) return
        lastActivityAt = Date.now()
        try {
          const data = JSON.parse(event.data) as IncomingMessage
          const handlers = listeners.get(data.channel)
          if (handlers) {
            handlers.forEach((handler) => handler(data))
          }
        } catch (err) {
          console.error('WS Parse Error', err)
        }
      }

      sock.onclose = () => {
        if (activeSocket !== sock) return

        connected.value = false
        clearTimers()

        if (!explicitClose) {
          handleReconnect()
        } else {
          console.log('⚡ WS Paused (Idle/Hidden)')
        }
      }

      sock.onerror = (err) => {
        // onerror is followed by onclose, which does the reconnect logic.
        console.error('WS Error:', err)
        sock.close()
      }
    })
  }

  const disconnect = () => {
    explicitClose = true
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    clearTimers()
    activeSocket?.close()
  }

  const sendRaw = (msg: OutgoingMessage) => {
    const s = activeSocket
    if (s?.readyState === WebSocket.OPEN) {
      s.send(JSON.stringify(msg))
    } else {
      // Bound the queue so a flapping connection can't grow it forever.
      if (messageQueue.length >= MAX_QUEUE) {
        messageQueue.shift()
      }
      messageQueue.push(msg)
    }
  }

  const handleReconnect = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)

    const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000)
    reconnectAttempts++
    console.log(`🔌 WS Disconnected. Reconnecting in ${delay}ms...`)
    reconnectTimer = window.setTimeout(() => connect(), delay)
  }

  const startHeartbeat = () => {
    if (heartbeatTimer) window.clearInterval(heartbeatTimer)
    heartbeatTimer = window.setInterval(() => {
      const s = activeSocket
      if (s?.readyState === WebSocket.OPEN) {
        s.send(JSON.stringify({ type: 'ping' } satisfies OutgoingMessage))
      }
    }, HEARTBEAT_INTERVAL_MS)
  }

  const startWatchdog = () => {
    if (watchdogTimer) window.clearInterval(watchdogTimer)
    watchdogTimer = window.setInterval(() => {
      const s = activeSocket
      if (s?.readyState === WebSocket.OPEN && Date.now() - lastActivityAt > STALE_AFTER_MS) {
        console.warn('🔌 WS watchdog: no traffic, forcing reconnect')
        s.close()
      }
    }, WATCHDOG_INTERVAL_MS)
  }

  const resubscribeAll = () => {
    listeners.forEach((_, channel) => {
      sendRaw({ type: 'subscribe', channel })
    })
  }

  const subscribe = <T>(
    channel: string,
    callback: (msg: IncomingMessage<T>) => void
  ): WSSubscribtion => {
    if (!listeners.has(channel)) {
      listeners.set(channel, new Set())
      sendRaw({ type: 'subscribe', channel })
    }

    const internalHandler: InternalHandler = (msg) => {
      callback(msg as IncomingMessage<T>)
    }

    listeners.get(channel)!.add(internalHandler)

    return {
      unsubscribe: () => {
        const channelListeners = listeners.get(channel)
        if (channelListeners) {
          channelListeners.delete(internalHandler)

          if (channelListeners.size === 0) {
            listeners.delete(channel)
            sendRaw({ type: 'unsubscribe', channel })
          }
        }
      }
    }
  }

  return {
    socket,
    connected,
    connect,
    disconnect,
    subscribe
  }
}
