type Deployment = {
  id: number
  application_id: number
  branch: string
  commit_hash: string | null
  commit_message: string | null
  status: string
  triggered_at: string
  started_at: string | null
  finished_at: string | null
  deployed_by: number | null

  env_snapshot?: Record<string, string> | null
  previous_deployment_id?: number | null
  previous_commit_hash?: string | null

  deployer: User | null
  logs?: Log[]
}

// P3-19: diff between a deployment and its previous successful one.
type DeploymentDiff = {
  deployment_id: number
  commit_from: string | null
  commit_to: string | null
  commit_message: string | null
  has_previous: boolean
  env_additions: EnvDiffEntry[]
  env_removals: EnvDiffEntry[]
  env_updates: EnvDiffEntry[]
}

type EnvDiffEntry = {
  key: string
  old?: string
  new?: string
}

type DeploymentCriteria = Criteria & {
  application_id?: string | null
  deployed_by?: string | null
  statuses?: string | null
}

type EventDeploymentCreated = {
  deployment_id: number
  application_id: number
  deployed_by: number
  triggered_at: string
}

type EventDeploymentStarted = {
  deployment_id: number
  application_id: number
  started_at: string
}

type EventDeploymentFinished = {
  deployment_id: number
  application_id: number
  finished_at: number
}

type EventDeploymentStatusChanged = {
  deployment_id: number
  application_id: number
  status: string
}

type EventDeploymentCommitInfoReceived = {
  deployment_id: number
  application_id: number
  commit_hash: string
  commit_message: string
}
