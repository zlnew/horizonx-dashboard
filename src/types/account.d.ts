type UpdateProfileRequest = {
  name: string
}

type ChangePasswordRequest = {
  current_password: string
  password: string
  password_confirmation: string
}

type AccountSession = {
  id: string
  ip: string
  user_agent: string
  created_at: string
  expires_at: string
  is_current: boolean
}
