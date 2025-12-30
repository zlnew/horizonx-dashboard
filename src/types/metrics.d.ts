type Metrics = {
  server_id: string
  cpu: CPUMetric
  gpu: GPUMetric[]
  memory: MemoryMetric
  disk: DiskMetric[]
  network: NetworkMetric
  uptime_seconds: number
  recorded_at: string
}

type Signal = {
  raw: number
  ema: number
}

type OsInfo = {
  hostname: string
  name: string
  kernel_version: string
  arch: string
}

type CPUMetric = {
  usage: Signal
  per_core: Signal[]
  temperature: Signal
  frequency: Signal
  power_watt: Signal
}

type GPUMetric = {
  card: string
  vendor: string
  temperature: Signal
  core_usage_percent: Signal
  frequency_mhz: Signal
  vram_total_gb: number
  vram_used_gb: number
  vram_percent: number
  power_watt: Signal
}

type MemoryMetric = {
  total_gb: number
  used_gb: number
  usage_percent: number
  available_gb: number
  swap_total_gb: number
  swap_free_gb: number
  swap_used_gb: number
}

type FilesystemUsage = {
  device: string
  mountpoint: string
  total_gb: number
  used_gb: number
  free_gb: number
  percent: number
}

type DiskMetric = {
  name: string
  raw_size_gb: number
  temperature: Signal
  read_mbps: Signal
  write_mbps: Signal
  util_pct: Signal
  filesystems: FilesystemUsage[] | null
}

type NetworkMetric = {
  rx_bytes: number
  tx_bytes: number
  rx_speed_mbs: Signal
  tx_speed_mbs: Signal
}

type CpuUsagePoint = {
  at: Date
  usage_percent: number
}

type NetSpeedPoint = {
  at: Date
  rx_mbs: number
  tx_mbs: number
}
