import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the app composable so wsURL is deterministic.
vi.mock('@/composables/app', () => ({
  default: () => ({ wsURL: 'ws://test/api/ws/user' })
}))

// Minimal WebSocket mock that tracks instances and lets tests drive events.
type Handler = ((...args: never[]) => void) | null

class MockWebSocket {
  static instances: MockWebSocket[] = []
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  url: string
  readyState = MockWebSocket.CONNECTING
  onopen: Handler = null
  onmessage: Handler = null
  onclose: Handler = null
  onerror: Handler = null
  sent: string[] = []

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.()
  }

  // test helpers
  open() {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.()
  }

  receive(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) } as never)
  }
}

vi.stubGlobal('WebSocket', MockWebSocket)

// The composable is a module-level singleton (socket state persists across
// calls), so each test needs a fresh module instance.
async function freshWebSocket() {
  vi.resetModules()
  const mod = await import('@/composables/web-socket')
  return mod.default()
}

describe('useWebSocket', () => {
  beforeEach(() => {
    MockWebSocket.instances = []
    vi.useFakeTimers()
    vi.stubGlobal('WebSocket', MockWebSocket)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('connects and sends subscribe after open', async () => {
    const ws = await freshWebSocket()
    ws.connect()
    ws.subscribe('deployment:1', () => {})

    expect(MockWebSocket.instances).toHaveLength(1)
    const sock = MockWebSocket.instances[0]!
    sock.open()

    expect(sock.sent).toContain(
      JSON.stringify({ type: 'subscribe', channel: 'deployment:1' })
    )
  })

  it('reconnects with backoff when the socket closes unexpectedly', async () => {
    const ws = await freshWebSocket()
    ws.connect()
    const sock = MockWebSocket.instances[0]!
    sock.open()

    // Drop: close the socket without explicitClose (i.e. via network loss).
    // We simulate by calling close() directly on the instance — the real
    // composable's disconnect path is separate.
    sock.readyState = MockWebSocket.CLOSED
    sock.onclose?.()

    vi.advanceTimersByTime(1100)
    expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2)
  })

  it('watchdog force-closes a stale OPEN socket (no traffic)', async () => {
    const ws = await freshWebSocket()
    ws.connect()
    const sock = MockWebSocket.instances[0]!
    sock.open() // lastActivityAt set at open

    // No messages for a while — the watchdog should close the stale socket,
    // which triggers the reconnect path.
    vi.advanceTimersByTime(90_000) // > STALE_AFTER_MS (75s)

    expect(sock.readyState).toBe(MockWebSocket.CLOSED)
    // A reconnect should have been scheduled by onclose.
    vi.advanceTimersByTime(1100)
    expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2)
  })

  it('sends application-level pings on a heartbeat cadence', async () => {
    const ws = await freshWebSocket()
    ws.connect()
    const sock = MockWebSocket.instances[0]!
    sock.open()

    vi.advanceTimersByTime(25_000)

    expect(sock.sent.some((m) => m.includes('"ping"'))).toBe(true)
  })

  it('does NOT reconnect when disconnect() was explicit', async () => {
    const ws = await freshWebSocket()
    ws.connect()
    const sock = MockWebSocket.instances[0]!
    sock.open()

    ws.disconnect()
    vi.advanceTimersByTime(30_000)

    // No new instances: explicit close must not schedule reconnect.
    expect(MockWebSocket.instances.length).toBe(1)
  })
})
