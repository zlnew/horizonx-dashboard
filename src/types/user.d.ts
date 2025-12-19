type User = {
  id: number
  name: string
  email: string
  role_id: number
  created_at: string
  updated_at: string

  role: Role
  permissions: Permission[] | null
}

type Role = {
  id: number
  name: string
}

type Permission = {
  id: number
  name: string
}
