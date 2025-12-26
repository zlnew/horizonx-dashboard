type ApplicationCriteria = Criteria & {
  server_id?: string | null
}

type Application = {
  id: number
  server_id: string
  name: string
  repo_url: string
  branch: string
  status: string
  last_deployment_at: string | null
  created_at: string
  updated_at: string

  server: Server | null
  env_vars: EnvironmentVariable[] | null
  logs: Log[] | null
}

type ApplicationCreateRequest = {
  server_id: string
  name: string
  repo_url: string
  branch: string

  env_vars: EnvironmentVariableRequest[] | null
}

type ApplicationUpdateRequest = {
  name: string
  repo_url: string
  branch: string

  env_vars: EnvironmentVariableRequest[] | null
}

type EnvironmentVariable = {
  id: number
  application_id: number
  key: string
  value: string
  is_preview: boolean
  created_at: string
  updated_at: string

  application: Application | null
}

type EnvironmentVariableRequest = {
  key: string
  value: string
  is_preview: boolean
}

type EventApplicationStatusChanged = {
  application_id: number
  status: string
}
