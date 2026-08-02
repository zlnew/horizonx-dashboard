type AuditLog = {
  id: number
  actor_id: number | null
  actor_email: string | null
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}

type AuditLogCriteria = Criteria & {
  action?: string
  resource_type?: string
}
