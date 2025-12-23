type Job = {
  id: number
  server_id: string
  application_id: number | null
  deployment_id: number | null
  job_type: string
  status: string
  output_log: string
  queued_at: string | null
  started_at: string | null
  finished_at: string | null
}
