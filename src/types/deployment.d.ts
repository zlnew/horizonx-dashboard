type Deployment = {
  id: number
  application_id: number
  branch: string
  commit_hash: string | null
  commit_message: string | null
  status: string
  build_logs: string | null
  triggered_at: string
  started_at: string | null
  finished_at: string | null
  deployed_by: number | null

  application: Application | null
  deployer: User | null
}
