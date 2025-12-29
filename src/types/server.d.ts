type Server = {
  id: string
  name: string
  ip_address: string
  is_online: boolean
  created_at: string
  updated_at: string

  os_info?: OsInfo | null
}

type ServerCriteria = Criteria & {
  is_online?: boolean
}

type EventServerStatusChanged = {
  server_id: string
  is_online: boolean
}
