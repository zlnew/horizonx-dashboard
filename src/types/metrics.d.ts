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

type OsInfo = {
  hostname: string
  name: string
  kernel_version: string
  arch: string
}

type CPUMetric = {
  usage: number
  per_core: number[]
  temperature: number
  frequency: number
  power_watt: number
}

type GPUMetric = {
  card: string
  vendor: string
  temperature: number
  core_usage_percent: number
  frequency_mhz: number
  vram_total_gb: number
  vram_used_gb: number
  vram_percent: number
  power_watt: number
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
  temperature: number
  read_mbps: number
  write_mbps: number
  util_pct: number
  filesystems: FilesystemUsage[] | null
}

type NetworkMetric = {
  rx_bytes: number
  tx_bytes: number
  rx_speed_mbs: number
  tx_speed_mbs: number
}

type CpuUsageHistory = {
  timestamp: Date
  usage: number
}

type NetHistory = {
  timestamp: Date
  download: number
  upload: number
}
