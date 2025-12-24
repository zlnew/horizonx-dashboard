const WSEvent = {
  SERVER_STATUS_CHANGED: 'server_status_changed',
  SERVER_METRICS_RECEIVED: 'server_metrics_received',
  APPLICATION_STATUS_CHANGED: 'application_status_changed',
  DEPLOYMENT_STATUS_CHANGED: 'deployment_status_changed',
  DEPLOYMENT_LOGS_UPDATED: 'deployment_logs_updated',
  DEPLOYMENT_COMMIT_INFO_RECEIVED: 'deployment_commit_info_received',
  JOB_CREATED: 'job_created',
  JOB_STARTED: 'job_started',
  JOB_FINISHED: 'job_finished',
  JOB_STATUS_CHANGED: 'job_status_changed'
}

export default WSEvent
