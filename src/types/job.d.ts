type Job = {
  id: number
  server_id: string
  application_id: string | null
  job_type: string
  status: string
  output_log: string
  queued_at: string | null
  started_at: string | null
  finished_at: string | null
}
