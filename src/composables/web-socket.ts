import { onUnmounted, ref } from 'vue'
import useApp from '@/composables/app'

type OutgoingMessage = {
  type: 'subscribe' | 'unsubscribe'
  channel: string
}

type IncomingMessage = {
  type: string
  event: string
  channel: string
  payload: unknown
}

export default function useWebSocket() {
  const { wsURL } = useApp()
  let socket: WebSocket | null = null
  let openPromise: Promise<void> | null = null

  const connected = ref(false)
  const listeners = new Map<string, (msg: IncomingMessage) => void>()
  const queue: OutgoingMessage[] = []

  const connect = (): Promise<void> => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      connected.value = true
      return Promise.resolve()
    }

    if (socket && socket.readyState === WebSocket.CONNECTING) {
      return openPromise!
    }

    socket = new WebSocket(wsURL)

    openPromise = new Promise((resolve, reject) => {
      socket!.onopen = () => {
        connected.value = true
        console.log('WS connected')
        for (const msg of queue) socket!.send(JSON.stringify(msg))
        queue.length = 0
        resolve()
      }

      socket!.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as IncomingMessage
          const handler = listeners.get(data.channel)
          if (handler) handler(data)
        } catch (err) {
          console.error('WS parse error', err)
        }
      }

      socket!.onclose = () => {
        connected.value = false
        console.log('WS closed, reconnecting in 3s...')
        setTimeout(() => connect(), 3000)
      }

      socket!.onerror = (err) => {
        console.error('WS error:', err)
        reject(err)
      }
    })

    return openPromise
  }

  const safeSend = async (msg: OutgoingMessage) => {
    await connect()
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg))
    } else {
      queue.push(msg)
    }
  }

  const subscribe = (channel: string, callback: (incoming: IncomingMessage) => void) => {
    listeners.set(channel, callback)

    safeSend({ type: 'subscribe', channel })

    return {
      unsubscribe() {
        listeners.delete(channel)
        safeSend({
          type: 'unsubscribe',
          channel
        })
      }
    }
  }

  onUnmounted(() => {
    socket?.close()
  })

  return {
    connected,
    connect,
    subscribe,
    send: safeSend
  }
}
