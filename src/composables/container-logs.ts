import { computed, ref } from 'vue'
import ApplicationApi from '@/api/Application'
import WSEvent from '@/constants/ws-event'
import useWebSocket from '@/composables/web-socket'

const MAX_LINES = 5000
const MAX_DROPPED_CHUNKS = 9999

export type ContainerLogStatus =
  | 'idle' // never started, or stopped
  | 'starting'
  | 'tailing'
  | 'querying'
  | 'error'

export function useContainerLogs(applicationId: number) {
  const api = new ApplicationApi()
  const { subscribe } = useWebSocket()

  // --- state ---
  const lines = ref<ContainerLogLine[]>([])
  const status = ref<ContainerLogStatus>('idle')
  const error = ref<string | null>(null)

  const streaming = ref(false) // a live --follow tail is active
  const following = ref(true) // auto-scroll toggle (LogConsole owns the scroll listener)
  const droppedChunks = ref(0) // gap counter from seq mismatch
  const streamId = ref<string | null>(null)
  const service = ref<string>('') // active service filter
  const since = ref<string>('') // "15m" | "1h" | "6h" | "24h" | custom

  let subscription: WSSubscribtion | null = null
  let lastSeq = 0
  let hasSeenSeq = false

  // --- helpers ---
  const channel = computed(() => `app_logs:${applicationId}`)

  const resetSession = () => {
    lines.value = []
    droppedChunks.value = 0
    lastSeq = 0
    hasSeenSeq = false
    error.value = null
  }

  const stopLive = async () => {
    if (streamId.value) {
      try {
        await api.stopTailLogs<ApiResponse<unknown>>(applicationId, streamId.value)
      } catch {
        // The stream died with the tab close anyway; don't surface noise.
      }
    }
    streamId.value = null
  }

  const detach = () => {
    if (subscription) {
      subscription.unsubscribe()
      subscription = null
    }
  }

  const handleChunk = (msg: { payload: ContainerLogChunk }) => {
    const chunk = msg.payload
    if (!chunk) return

    // Seq-gap honesty: the hub drops events silently under load. Track the
    // last seq we saw for THIS stream; a jump renders the dropped marker.
    if (hasSeenSeq && chunk.seq > lastSeq + 1) {
      droppedChunks.value = Math.min(
        droppedChunks.value + (chunk.seq - lastSeq - 1),
        MAX_DROPPED_CHUNKS
      )
    }
    if (chunk.seq > lastSeq || !hasSeenSeq) {
      lastSeq = chunk.seq
      hasSeenSeq = true
    }

    if (chunk.lines?.length) {
      lines.value.push(...chunk.lines)
      if (lines.value.length > MAX_LINES) {
        lines.value.splice(0, lines.value.length - MAX_LINES)
      }
    }

    if (chunk.error) {
      error.value = chunk.error
    }

    if (chunk.eof) {
      streaming.value = false
      status.value = 'idle'
      detach()
      streamId.value = null
    }
  }

  const attach = () => {
    if (subscription) return
    subscription = subscribe<EventContainerLogChunk>(channel.value, handleChunk)
  }

  const start = async (opts?: { tail?: number; service?: string }) => {
    resetSession()
    error.value = null
    status.value = 'starting'
    attach()

    try {
      const res = await api.tailLogs<ApiResponse<{ stream_id: string }>>(applicationId, {
        tail: opts?.tail ?? 200,
        service: opts?.service ?? service.value
      })
      streamId.value = res.data?.stream_id ?? null
      streaming.value = true
      status.value = 'tailing'
    } catch (err) {
      status.value = 'error'
      error.value = err instanceof Error ? err.message : 'failed to start log tail'
      detach()
    }
  }

  const stop = async () => {
    streaming.value = false
    status.value = 'idle'
    await stopLive()
    detach()
  }

  const query = async (opts?: { tail?: number; service?: string; since?: string; until?: string }) => {
    resetSession()
    error.value = null
    status.value = 'querying'
    attach()

    try {
      await api.queryLogs<ApiResponse<{ query_id: string }>>(applicationId, {
        tail: opts?.tail ?? 1000,
        service: opts?.service ?? service.value,
        since: (opts?.since ?? since.value) || undefined,
        until: opts?.until
      })
      status.value = 'tailing' // stream is live until EOF arrives
    } catch (err) {
      status.value = 'error'
      error.value = err instanceof Error ? err.message : 'failed to query logs'
      detach()
    }
  }

  const dispose = () => {
    void stopLive()
    detach()
  }

  return {
    lines,
    status,
    error,
    streaming,
    following,
    droppedChunks,
    service,
    since,
    start,
    stop,
    query,
    dispose
  }
}
