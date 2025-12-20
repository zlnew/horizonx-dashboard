type Application = {
  id: number
  server_id: string
  name: string
  repo_url: string
  branch: string
  docker_compose_raw: string | null
  status: string
  last_deployment_at: string | null
  created_at: string
  updated_at: string

  server: Server | null
  env_vars: EnvironmentVariable[] | null
  volumes: Volume[] | null
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

type Volume = {
  id: number
  application_id: number
  host_path: string
  container_path: string
  mode: string
  created_at: string

  application: Application | null
}

type ApplicationCreateRequest = {
  server_id: string
  name: string
  repo_url: string
  branch: string
  docker_compose_raw: string

  env_vars: EnvironmentVariableRequest[] | null
  volumes: VolumeRequest[] | null
}

type ApplicationUpdateRequest = {
  name: string
  repo_url: string
  branch: string
  docker_compose_raw: string

  env_vars: EnvironmentVariableRequest[] | null
  volumes: VolumeRequest[] | null
}

type EnvironmentVariableRequest = {
  key: string
  value: string
  is_preview: boolean
}

type VolumeRequest = {
  host_path: string
  container_path: string
  mode: string
}
