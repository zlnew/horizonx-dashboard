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

  deployer: User | null
  logs?: Log[]
}

type DeploymentCriteria = Criteria & {
  application_id?: string | null
  deployed_by?: string | null
  statuses?: string | null
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
