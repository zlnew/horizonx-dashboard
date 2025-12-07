import { onUnmounted, ref } from 'vue'
import useApp from '@/composables/app'

type OutgoingMessage = {
  type: 'subscribe' | 'unsubscribe'
  channel: string
}

type IncomingMessage = {
  channel: string
  payload: unknown
}

export default function useSocket() {
  const { wsURL } = useApp()
  const socket = new WebSocket(wsURL)

  const connected = ref(false)
  const listeners = new Map<string, (payload: unknown) => void>()
  const queue: OutgoingMessage[] = []

  function safeSend(msg: OutgoingMessage) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg))
    } else {
      queue.push(msg)
    }
  }

  socket.onopen = () => {
    connected.value = true

    for (const msg of queue) {
      socket.send(JSON.stringify(msg))
    }

    queue.length = 0
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data) as IncomingMessage
    const handler = listeners.get(data.channel)
    if (handler) handler(data.payload)
  }

  socket.onerror = (error) => {
    console.error('WS error:', error)
  }

  socket.onclose = () => {
    connected.value = false
    console.log('WS closed')
  }

  function subscribe(channel: string, callback: (payload: unknown) => void) {
    listeners.set(channel, callback)

    safeSend({
      type: 'subscribe',
      channel
    })

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
    socket.close()
  })

  return {
    connected,
    subscribe,
    socket
  }
}
