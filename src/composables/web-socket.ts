import { ref } from 'vue'
import useApp from '@/composables/app'

type OutgoingMessage = {
  type: 'subscribe' | 'unsubscribe'
  channel: string
}

type IncomingMessage<T = unknown> = {
  type: string
  event: string
  channel: string
  payload: T
}

type InternalHandler = (msg: IncomingMessage<unknown>) => void

const socket = ref<WebSocket | null>(null)
const isConnected = ref(false)
const listeners = new Map<string, Set<(msg: IncomingMessage<unknown>) => void>>()
const messageQueue: OutgoingMessage[] = []

let reconnectAttempts = 0
let reconnectTimer: number | null = null
let explicitClose = false

export default function useWebSocket() {
  const { wsURL } = useApp()

  const connect = (): Promise<void> => {
    if (socket.value?.readyState === WebSocket.OPEN) return Promise.resolve()
    if (socket.value?.readyState === WebSocket.CONNECTING) return Promise.resolve()

    explicitClose = false
    socket.value = new WebSocket(wsURL)

    return new Promise((resolve) => {
      socket.value!.onopen = () => {
        console.log('⚡ WS Connected')
        isConnected.value = true
        reconnectAttempts = 0

        while (messageQueue.length > 0) {
          const msg = messageQueue.shift()
          if (msg) sendRaw(msg)
        }

        listeners.forEach((_, channel) => {
          sendRaw({ type: 'subscribe', channel })
        })

        resolve()
      }

      socket.value!.onmessage = (event) => {
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

      socket.value!.onclose = () => {
        isConnected.value = false
        if (!explicitClose) {
          handleReconnect()
        } else {
          console.log('⚡ WS Closed gracefully')
        }
      }

      socket.value!.onerror = (err) => {
        console.error('WS Error:', err)
        socket.value?.close()
      }
    })
  }

  const handleReconnect = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)

    const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000)
    reconnectAttempts++

    console.log(`🔌 WS Disconnected. Reconnecting in ${delay}ms...`)
    reconnectTimer = window.setTimeout(() => connect(), delay)
  }

  const sendRaw = (msg: OutgoingMessage) => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify(msg))
    } else {
      messageQueue.push(msg)
    }
  }

  const subscribe = <T>(channel: string, callback: (msg: IncomingMessage<T>) => void) => {
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

  const disconnect = () => {
    explicitClose = true
    socket.value?.close()
  }

  return {
    socket,
    connected: isConnected,
    connect,
    disconnect,
    subscribe
  }
}
