type Server = {
  id: string
  name: string
  ip_address: string
  is_online: boolean
  created_at: string
  updated_at: string
}

type ServerStatus = {
  server_id: string
  is_online: boolean
}
