import LogAction from '@/constants/log-action'
import LogLevel from '@/constants/log-level'
import LogStep from '@/constants/log-step'

export const logActionLabel = (value: string) => {
  switch (value) {
    case LogAction.APP_DEPLOY:
      return 'Deploying Application'
    case LogAction.APP_START:
      return 'Starting Application'
    case LogAction.APP_STOP:
      return 'Stopping Application'
    case LogAction.APP_RESTART:
      return 'Restarting Application'
    case LogAction.APP_HEALTH_CHECK:
      return 'Application Health Check'
  }
}

export const logLevelLabel = (value: string) => {
  switch (value) {
    case LogLevel.DEBUG:
      return 'DEBUG'
    case LogLevel.INFO:
      return 'INFO'
    case LogLevel.WARN:
      return 'WARN'
    case LogLevel.ERROR:
      return 'ERROR'
    case LogLevel.FATAL:
      return 'FATAL'
  }
}

export const logStepLabel = (value: string) => {
  switch (value) {
    case LogStep.GIT_CLONE:
      return 'Git Clone'
    case LogStep.DOCKER_BUILD:
      return 'Docker Containers Build'
    case LogStep.DOCKER_START:
      return 'Docker Containers Start'
    case LogStep.DOCKER_STOP:
      return 'Docker Containers Stop'
    case LogStep.DOCKER_RESTART:
      return 'Docker Containers Restart'
    case LogStep.DOCKER_HEALTH_CHECK:
      return 'Docker Containers Health Check'
  }
}
