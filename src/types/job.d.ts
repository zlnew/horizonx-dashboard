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

type JobCriteria = Criteria & {
  server_id?: string | null
  application_id?: string | null
  deployment_id?: string | null
  job_type?: string | null
  statuses?: string | null
}

type EventJobCreated = {
  job_id: number
  server_id: string
  application_id: number | null
  deployment_id: number | null
  job_type: string
}

type EventJobStarted = {
  job_id: number
  server_id: string
  application_id: number | null
  deployment_id: number | null
  job_type: string
}

type EventJobFinished = {
  job_id: number
  server_id: string
  application_id: number | null
  deployment_id: number | null
  job_type: string
  status: string
  output_log: string | null
}

type EventJobStatusChanged = {
  job_id: number
  status: string
}
