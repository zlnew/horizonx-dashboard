type UpdateProfileRequest = {
  name: string
}

type ChangePasswordRequest = {
  current_password: string
  password: string
  password_confirmation: string
}
