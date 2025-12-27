type Job = {
  id: number
  trace_id: string
  server_id: string
  application_id: number | null
  deployment_id: number | null
  type: string
  status: string
  queued_at: string | null
  started_at: string | null
  finished_at: string | null
  expired_at: string | null

  logs?: Log[]
}

type JobCriteria = Criteria & {
  trace_id?: string | null
  server_id?: string | null
  application_id?: string | null
  deployment_id?: string | null
  type?: string | null
  statuses?: string | null
}

type EventJobCreated = {
  job_id: number
  trace_id: string
  server_id: string
  application_id: number | null
  deployment_id: number | null
  type: string
}

type EventJobStarted = {
  job_id: number
  trace_id: string
  server_id: string
  application_id: number | null
  deployment_id: number | null
  type: string
}

type EventJobFinished = {
  job_id: number
  trace_id: string
  server_id: string
  application_id: number | null
  deployment_id: number | null
  type: string
  status: string
}

type EventJobStatusChanged = {
  job_id: number
  trace_id: string
  status: string
}
