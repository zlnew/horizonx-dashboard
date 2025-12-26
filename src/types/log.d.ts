type Log = {
  id: number
  timestamp: string
  level: string
  source: string
  action: string
  trace_id: string

  job_id: number | null
  server_id: string | null
  application_id: number | null
  deployment_id: number | null

  message: string
  context: LogContext | null

  created_at: string
}

type LogContext = {
  step: string
  stream: string
  line: string

  exit_code?: number
  latency?: number
  status?: string
}

type LogCriteria = Criteria & {
  trace_id?: string | null
  server_id?: string | null
  application_id?: string | null
  deployment_id?: string | null
  levels?: string | null
  sources?: string | null
  actions?: string | null
}

type EventLogReceived = Log
