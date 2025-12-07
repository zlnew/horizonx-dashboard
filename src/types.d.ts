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
  id: number
  card: string
  vendor: string
  model: string
  temperature: number
  core_usage_percent: number
  vram_total_gb: number
  vram_used_gb: number
  vram_percent: number
  power_watt: number
  fan_speed_percent: number
}

type MemoryMetric = {
  total_gb: number
  used_gb: number
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
  filesystems: FilesystemUsage[] | null
}

type NetworkMetric = {
  rx_bytes: number
  tx_bytes: number
  rx_speed: number
  tx_speed: number
}

type Metrics = {
  os_info: OsInfo
  cpu: CPUMetric
  gpu: GPUMetric[]
  memory: MemoryMetric
  disk: DiskMetric[]
  network: NetworkMetric
  uptime_seconds: number
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
